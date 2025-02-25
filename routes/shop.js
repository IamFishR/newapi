const express = require('express');
const router = express.Router();
const ShopService = require('../services/shop/ShopService');
const ProductService = require('../services/shop/ProductService');
const OrderService = require('../services/shop/OrderService');
const auth = require('../middleware/auth');
const { validateRequest } = require('../config/validate');
const { asyncHandler } = require('../utils/asyncHandler');

// Shop endpoints
router.post('/shops', auth, validateRequest({
    body: {
        name: { type: 'string', required: true },
        description: { type: 'string' },
        address: { type: 'string', required: true },
        phone: { type: 'string', required: true },
        email: { type: 'string', required: true, format: 'email' },
        business_hours: { type: 'object' }
    }
}), asyncHandler(async (req, res) => {
    const shop = await ShopService.createShop(req.body, req.user.id);
    res.status(201).json(shop);
}));

router.get('/shops', auth, asyncHandler(async (req, res) => {
    const shops = await ShopService.listShops(req.query);
    res.json(shops);
}));

router.get('/shops/:id', auth, asyncHandler(async (req, res) => {
    const shop = await ShopService.getShop(req.params.id);
    res.json(shop);
}));

router.put('/shops/:id', auth, validateRequest({
    body: {
        name: { type: 'string' },
        description: { type: 'string' },
        address: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string', format: 'email' },
        business_hours: { type: 'object' },
        is_active: { type: 'boolean' }
    }
}), asyncHandler(async (req, res) => {
    const shop = await ShopService.updateShop(req.params.id, req.body, req.user.id);
    res.json(shop);
}));

router.delete('/shops/:id', auth, asyncHandler(async (req, res) => {
    await ShopService.deleteShop(req.params.id, req.user.id);
    res.status(204).send();
}));

// Product endpoints
router.post('/products', auth, validateRequest({
    body: {
        name: { type: 'string', required: true },
        description: { type: 'string' },
        sku: { type: 'string' },
        barcode: { type: 'string' },
        price: { type: 'number', required: true },
        cost_price: { type: 'number' },
        quantity: { type: 'number' },
        minimum_quantity: { type: 'number' },
        category_id: { type: 'number' },
        shop_id: { type: 'number', required: true }
    }
}), asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.body, req.user.id);
    res.status(201).json(product);
}));

router.get('/products', auth, asyncHandler(async (req, res) => {
    const products = await ProductService.listProducts(req.query);
    res.json(products);
}));

router.get('/products/:id', auth, asyncHandler(async (req, res) => {
    const product = await ProductService.getProduct(req.params.id);
    res.json(product);
}));

router.put('/products/:id', auth, validateRequest({
    body: {
        name: { type: 'string' },
        description: { type: 'string' },
        sku: { type: 'string' },
        barcode: { type: 'string' },
        price: { type: 'number' },
        cost_price: { type: 'number' },
        quantity: { type: 'number' },
        minimum_quantity: { type: 'number' },
        category_id: { type: 'number' },
        shop_id: { type: 'number' },
        is_active: { type: 'boolean' }
    }
}), asyncHandler(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body, req.user.id);
    res.json(product);
}));

router.delete('/products/:id', auth, asyncHandler(async (req, res) => {
    await ProductService.deleteProduct(req.params.id, req.user.id);
    res.status(204).send();
}));

// Price History endpoints
router.post('/products/:id/price', auth, validateRequest({
    body: {
        price: { type: 'number', required: true, minimum: 0 }
    }
}), asyncHandler(async (req, res) => {
    const product = await ProductService.updatePrice(req.params.id, req.body.price, req.user.id);
    res.json(product);
}));

router.get('/products/:id/price-history', auth, asyncHandler(async (req, res) => {
    const priceHistory = await ProductService.getPriceHistory(req.params.id, req.query);
    res.json(priceHistory);
}));

// Inventory Management endpoints
router.post('/products/:id/inventory', auth, validateRequest({
    body: {
        quantity: { type: 'number', required: true },
        type: { type: 'string', required: true, enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        reference_type: { type: 'string' },
        reference_id: { type: 'number' },
        notes: { type: 'string' }
    }
}), asyncHandler(async (req, res) => {
    const { quantity, type, reference_type, reference_id, notes } = req.body;
    const product = await ProductService.updateInventory(
        req.params.id,
        quantity,
        type,
        req.user.id,
        reference_type,
        reference_id,
        notes
    );
    res.json(product);
}));

router.get('/products/:id/inventory-movements', auth, asyncHandler(async (req, res) => {
    const movements = await ProductService.getInventoryMovements(req.params.id, req.query);
    res.json(movements);
}));

// Product Tags endpoints
router.post('/products/:id/tags', auth, validateRequest({
    body: {
        name: { type: 'string', required: true }
    }
}), asyncHandler(async (req, res) => {
    const tag = await ProductService.addTag(req.params.id, req.body.name, req.user.id);
    res.json(tag);
}));

router.delete('/products/:id/tags/:tagId', auth, asyncHandler(async (req, res) => {
    await ProductService.removeTag(req.params.id, req.params.tagId);
    res.status(204).send();
}));

router.get('/products/:id/tags', auth, asyncHandler(async (req, res) => {
    const tags = await ProductService.getProductTags(req.params.id);
    res.json(tags);
}));

// Order endpoints
router.post('/orders', auth, validateRequest({
    body: {
        shop_id: { type: 'number', required: true },
        items: {
            type: 'array',
            required: true,
            items: {
                type: 'object',
                properties: {
                    product_id: { type: 'number', required: true },
                    quantity: { type: 'number', required: true, minimum: 1 }
                }
            }
        },
        notes: { type: 'string' }
    }
}), asyncHandler(async (req, res) => {
    const order = await OrderService.createOrder(req.body, req.user.id);
    res.status(201).json(order);
}));

router.get('/orders', auth, asyncHandler(async (req, res) => {
    const orders = await OrderService.listOrders(req.query);
    res.json(orders);
}));

router.get('/orders/:id', auth, asyncHandler(async (req, res) => {
    const order = await OrderService.getOrder(req.params.id);
    res.json(order);
}));

router.patch('/orders/:id/status', auth, validateRequest({
    body: {
        status: { 
            type: 'string', 
            required: true,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        }
    }
}), asyncHandler(async (req, res) => {
    const order = await OrderService.updateOrderStatus(req.params.id, req.body.status, req.user.id);
    res.json(order);
}));

module.exports = router;