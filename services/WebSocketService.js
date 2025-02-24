const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const config = require('../config/validate')();
const MonitoringService = require('./monitoring/MonitoringService');
const LoggingService = require('./monitoring/LoggingService');

class WebSocketService {
    constructor() {
        this.clients = new Map();
        this.subscriptions = new Map();
        this.connectionAttempts = new Map(); // Track reconnection attempts per client
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second delay
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            // Handle connection errors
            handleProtocols: (protocols, req) => {
                return protocols[0];
            },
            verifyClient: async (info, cb) => {
                try {
                    const token = new URL(info.req.url, 'ws://localhost').searchParams.get('token');
                    if (!token) {
                        cb(false, 401, 'Unauthorized');
                        return;
                    }

                    const decoded = jwt.verify(token, config.jwt.secret);
                    info.req.userId = decoded.userId;
                    cb(true);
                } catch (error) {
                    cb(false, 401, 'Invalid token');
                }
            }
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', this.handleServerError.bind(this));

        // Implement heartbeat
        this.heartbeatInterval = setInterval(() => {
            this.clients.forEach((client, userId) => {
                if (client.isAlive === false) {
                    this.handleClientDisconnect(userId, client);
                    return;
                }
                client.isAlive = false;
                client.ping();
            });
        }, 30000);
    }

    async handleConnection(ws, req) {
        const userId = req.userId;
        
        // Reset connection attempts and track session
        this.connectionAttempts.delete(userId);
        await MonitoringService.trackActiveSession(userId, {
            userAgent: req.headers['user-agent'],
            ip: req.socket.remoteAddress
        });
        
        ws.isAlive = true;
        this.clients.set(userId, ws);

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (message) => {
            try {
                this.handleMessage(userId, message);
            } catch (error) {
                this.handleMessageError(userId, error);
            }
        });

        ws.on('error', (error) => {
            this.handleClientError(userId, error);
        });

        ws.on('close', (code, reason) => {
            this.handleClientDisconnect(userId, ws, code, reason);
        });

        // Send initial state
        this.sendMessage(userId, {
            type: 'CONNECTION_ESTABLISHED',
            data: { userId, timestamp: new Date().toISOString() }
        });
    }

    handleClientError(userId, error) {
        LoggingService.logError(error, { userId, context: 'WebSocket client error' });
        MonitoringService.trackError('websocket_client_error', {
            userId,
            error: error.message
        });
        this.attemptReconnection(userId);
    }

    handleServerError(error) {
        LoggingService.logError(error, { context: 'WebSocket server error' });
        MonitoringService.trackError('websocket_server_error', {
            error: error.message
        });
        // Notify all clients of the error
        this.clients.forEach((client, userId) => {
            this.sendMessage(userId, {
                type: 'SERVER_ERROR',
                data: { message: 'Server encountered an error' }
            });
        });
    }

    handleMessageError(userId, error) {
        LoggingService.logError(error, { userId, context: 'WebSocket message handling error' });
        this.sendMessage(userId, {
            type: 'ERROR',
            data: { message: 'Failed to process message' }
        });
    }

    handleClientDisconnect(userId, ws, code, reason) {
        this.clients.delete(userId);
        
        // Clean up subscriptions
        this.subscriptions.forEach((subscribers, topic) => {
            subscribers.delete(userId);
            if (subscribers.size === 0) {
                this.subscriptions.delete(topic);
            }
        });

        // Attempt reconnection if not a normal closure
        if (code !== 1000) {
            this.attemptReconnection(userId);
        }
    }

    async attemptReconnection(userId) {
        const attempts = this.connectionAttempts.get(userId) || 0;
        
        if (attempts < this.maxReconnectAttempts) {
            this.connectionAttempts.set(userId, attempts + 1);
            
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
            
            setTimeout(() => {
                // Notify client to attempt reconnection
                this.broadcastToTopic('system', {
                    type: 'RECONNECT_REQUEST',
                    data: { userId }
                });
            }, delay);
        } else {
            // Max attempts reached, notify subscribers
            this.broadcastToTopic('system', {
                type: 'CONNECTION_FAILED',
                data: { userId }
            });
            this.connectionAttempts.delete(userId);
        }
    }

    handleMessage(userId, rawMessage) {
        try {
            const message = JSON.parse(rawMessage);
            
            switch (message.type) {
                case 'SUBSCRIBE':
                    this.handleSubscribe(userId, message.topics);
                    break;
                case 'UNSUBSCRIBE':
                    this.handleUnsubscribe(userId, message.topics);
                    break;
                case 'SYNC_REQUEST':
                    this.handleSyncRequest(userId, message.data);
                    break;
                default:
                    LoggingService.logDebug(`Unknown message type received`, { 
                        userId, 
                        messageType: message.type 
                    });
            }
        } catch (error) {
            LoggingService.logError(error, { 
                userId, 
                context: 'WebSocket message parsing error',
                rawMessage 
            });
        }
    }

    handleSubscribe(userId, topics) {
        topics.forEach(topic => {
            if (!this.subscriptions.has(topic)) {
                this.subscriptions.set(topic, new Set());
            }
            this.subscriptions.get(topic).add(userId);
        });

        this.sendMessage(userId, {
            type: 'SUBSCRIBED',
            data: { topics }
        });
    }

    handleUnsubscribe(userId, topics) {
        topics.forEach(topic => {
            const subscribers = this.subscriptions.get(topic);
            if (subscribers) {
                subscribers.delete(userId);
                if (subscribers.size === 0) {
                    this.subscriptions.delete(topic);
                }
            }
        });

        this.sendMessage(userId, {
            type: 'UNSUBSCRIBED',
            data: { topics }
        });
    }

    async handleSyncRequest(userId, data) {
        try {
            const { type, lastSyncTime } = data;
            let updates;

            switch (type) {
                case 'PORTFOLIO':
                    updates = await this.getPortfolioUpdates(userId, lastSyncTime);
                    break;
                case 'PREFERENCES':
                    updates = await this.getPreferenceUpdates(userId, lastSyncTime);
                    break;
                // Add more sync types as needed
            }

            this.sendMessage(userId, {
                type: 'SYNC_RESPONSE',
                data: { type, updates }
            });
        } catch (error) {
            LoggingService.logError(error, { 
                userId, 
                context: 'WebSocket sync request error',
                syncData: data 
            });
            this.sendMessage(userId, {
                type: 'ERROR',
                data: { message: 'Sync failed' }
            });
        }
    }

    // Broadcasting methods
    broadcastToTopic(topic, message) {
        const subscribers = this.subscriptions.get(topic);
        if (subscribers) {
            subscribers.forEach(userId => this.sendMessage(userId, message));
        }
    }

    sendMessage(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    notifyUserUpdate(userId, data) {
        this.sendMessage(userId, {
            type: 'USER_UPDATE',
            data
        });
    }

    notifyPortfolioUpdate(userId, data) {
        this.sendMessage(userId, {
            type: 'PORTFOLIO_UPDATE',
            data
        });
    }

    notifyPreferencesUpdate(userId, data) {
        this.sendMessage(userId, {
            type: 'PREFERENCES_UPDATE',
            data
        });
    }

    getStatus() {
        return {
            activeConnections: this.clients.size,
            activeSubscriptions: this.subscriptions.size,
            reconnectionAttempts: Object.fromEntries(this.connectionAttempts),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            lastErrors: MonitoringService.metrics.errors
                .filter(e => e.type.startsWith('websocket'))
                .slice(-5)
        };
    }

    // Cleanup method
    cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.clients.forEach((client, userId) => {
            try {
                client.terminate();
                MonitoringService.metrics.activeConnections--;
            } catch (error) {
                MonitoringService.trackError('websocket_cleanup_error', {
                    userId,
                    error: error.message
                });
            }
        });
        
        this.clients.clear();
        this.subscriptions.clear();
        this.connectionAttempts.clear();
    }
}

module.exports = new WebSocketService();