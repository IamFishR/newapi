const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const { BudgetCategory } = require('../models');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get all budget categories
router.get('/budget-categories', auth.isAuthenticated, async (req, res) => {
    try {
        const categories = await BudgetCategory.findAll({
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget categories' });
        res.status(500).json({ error: error.message });
    }
});

// Get a specific budget category
router.get('/budget-categories/:id', auth.isAuthenticated, async (req, res) => {
    try {
        const category = await BudgetCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Budget category not found' });
        }
        res.json(category);
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget category by ID' });
        res.status(500).json({ error: error.message });
    }
});

// Create a new budget category
router.post('/budget-categories', auth.isAuthenticated, async (req, res) => {
    try {
        const { name, color } = req.body;
        
        // Basic validation
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Validate color format if provided
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color (e.g., #FF0000)' });
        }

        const category = await BudgetCategory.create({
            name,
            color
        });

        res.status(201).json(category);
    } catch (error) {
        LoggingService.logError(error, { context: 'Create budget category' });
        res.status(500).json({ error: error.message });
    }
});

// Update a budget category
router.put('/budget-categories/:id', auth.isAuthenticated, async (req, res) => {
    try {
        const { name, color } = req.body;
        const category = await BudgetCategory.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Budget category not found' });
        }

        // Basic validation
        if (name === '') {
            return res.status(400).json({ error: 'Name cannot be empty' });
        }

        // Validate color format if provided
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color (e.g., #FF0000)' });
        }

        await category.update({
            name: name || category.name,
            color: color || category.color
        });

        res.json(category);
    } catch (error) {
        LoggingService.logError(error, { context: 'Update budget category' });
        res.status(500).json({ error: error.message });
    }
});

// Delete a budget category
router.delete('/budget-categories/:id', auth.isAuthenticated, async (req, res) => {
    try {
        const category = await BudgetCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Budget category not found' });
        }

        await category.destroy();
        res.json({ message: 'Budget category deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete budget category' });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;