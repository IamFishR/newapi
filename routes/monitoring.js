const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const MonitoringService = require('../services/monitoring/MonitoringService');
const WebSocketService = require('../services/WebSocketService');

// Health check endpoint - public
router.get('/health', apiLimiter, async (req, res) => {
    try {
        const health = await MonitoringService.getSystemHealth();
        res.json({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            connections: health.activeConnections
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Service unavailable'
        });
    }
});

// Detailed metrics - admin only
router.get('/metrics', auth.isAuthenticated, auth.hasRole('admin'), async (req, res) => {
    try {
        const health = await MonitoringService.getSystemHealth();
        const wsStatus = WebSocketService.getStatus();
        
        res.json({
            status: 'ok',
            metrics: {
                ...health,
                websocket: wsStatus,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;