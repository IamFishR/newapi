const { User, Portfolio, Transaction } = require('../../models');
const { Op } = require('sequelize');
const PreferenceService = require('./PreferenceService');
const SessionService = require('./SessionService');
const AuditService = require('../audit/AuditService');

class UserService {
    // Create
    async createUser(data, req = null) {
        try {
            // Separate core user data from preference data
            const userData = {
                username: data.username,
                email: data.email,
                password: data.password
            };

            const preferenceData = {
                bio: data.bio,
                avatar_url: data.avatar,
                social_media: data.social_media,
                theme: data.theme || 'light',
                language: data.language || 'en'
            };

            const user = await User.create(userData);

            // Only create preferences if user creation was successful
            await PreferenceService.createOrUpdatePreferences(user.id, preferenceData);
            
            const deviceInfo = req?.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {};
            const session = await SessionService.createSession(user.id, deviceInfo, req?.ip);
            
            await AuditService.logUserAction(user.id, 'USER_CREATED', data, req);
            
            return { user, session };
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error('User with this email or username already exists');
            }
            throw error;
        }
    }

    async loginUser(email, password, req = null) {
        const user = await this.getUserByEmail(email);
        if (!user || !(await user.validatePassword(password))) {
            throw new Error('Invalid credentials');
        }

        const deviceInfo = req?.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {};
        const session = await SessionService.createSession(user.id, deviceInfo, req?.ip);

        return { user, session };
    }

    async logoutUser(sessionToken) {
        await SessionService.invalidateSession(sessionToken);
    }

    // Read
    async getUser(id) {
        const user = await User.findByPk(id, {
            attributes: {
                exclude: ['password']
            }
        });
        return user;
    }

    async getUserByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async getUserPortfolio(userId) {
        return await Portfolio.findAll({
            where: { user_id: userId },
            include: ['Company']
        });
    }

    async getUserTransactions(userId, options = {}) {
        const defaultOptions = {
            where: { user_id: userId },
            include: ['Company'],
            order: [['transaction_date', 'DESC']],
            limit: 10
        };
        return await Transaction.findAll({ ...defaultOptions, ...options });
    }

    // Update
    async updateUser(id, data, req = null) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        
        const oldValues = user.toJSON();
        await user.update(data);
        await AuditService.logUserAction(id, 'USER_UPDATED', {
            oldValues,
            newValues: data
        }, req);
        
        return user;
    }

    // User Profile Management
    async updateUserProfile(id, profileData, req = null) {
        const [user, preferences] = await Promise.all([
            this.updateUser(id, {
                username: profileData.username,
                email: profileData.email
            }, req),
            PreferenceService.updateProfile(id, {
                bio: profileData.bio,
                avatar_url: profileData.avatar,
                social_media: profileData.social_media
            })
        ]);

        await AuditService.logUserAction(id, 'PROFILE_UPDATED', profileData, req);
        return { user, preferences };
    }

    // Delete
    async deleteUser(id, req = null) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        
        const userData = user.toJSON();
        await user.destroy();
        await AuditService.logUserAction(id, 'USER_DELETED', userData, req);
    }

    // Portfolio Operations
    async updatePortfolio(userId, symbol, quantity, price) {
        const portfolio = await Portfolio.findOne({
            where: { user_id: userId, symbol }
        });

        if (portfolio) {
            return await portfolio.update({
                quantity: quantity,
                average_price: price
            });
        } else {
            return await Portfolio.create({
                user_id: userId,
                symbol,
                quantity,
                average_price: price
            });
        }
    }

    // Transaction Operations
    async recordTransaction(transactionData) {
        const transaction = await Transaction.create(transactionData);
        await this.updatePortfolioFromTransaction(transaction);
        return transaction;
    }

    // Helper method to update portfolio after transaction
    async updatePortfolioFromTransaction(transaction) {
        const portfolio = await Portfolio.findOne({
            where: { user_id: transaction.user_id, symbol: transaction.symbol }
        });

        const quantity = transaction.transaction_type === 'BUY' ? 
            (portfolio?.quantity || 0) + transaction.quantity :
            (portfolio?.quantity || 0) - transaction.quantity;

        if (quantity < 0) throw new Error('Insufficient shares');

        return await this.updatePortfolio(
            transaction.user_id,
            transaction.symbol,
            quantity,
            transaction.price
        );
    }

    // Admin Operations
    async getAllUsers() {
        return await User.findAll();
    }


    async getUserById(userId) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');
        return user;
    }
}

module.exports = new UserService();