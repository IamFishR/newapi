const express = require('express');
const router = express.Router();
const ShopService = require('../services/shop/ShopService');
const ProductService = require('../services/shop/ProductService');
const OrderService = require('../services/shop/OrderService');
const auth = require('../middleware/auth');

// Shop endpoints
router.post('/shops', auth.isAuthenticated, async (req, res) => {
    const shop = await ShopService.createShop(req.body, req.user.id);
    res.status(201).json(shop);
});

router.get('/shops', auth.isAuthenticated, async (req, res) => {
    const shops = await ShopService.listShops(req.query);
    res.json(shops);
});

router.get('/shops/:id', auth.isAuthenticated, async (req, res) => {
    const shop = await ShopService.getShop(req.params.id);
    res.json(shop);
});

router.put('/shops/:id', auth.isAuthenticated, async (req, res) => {
    const shop = await ShopService.updateShop(req.params.id, req.body, req.user.id);
    res.json(shop);
});

router.delete('/shops/:id', auth.isAuthenticated, async (req, res) => {
    await ShopService.deleteShop(req.params.id, req.user.id);
    res.status(204).send();
});

// Product endpoints
router.post('/products', auth.isAuthenticated, async (req, res) => {
    const product = await ProductService.createProduct(req.body, req.user.id);
    res.status(201).json(product);
});

router.get('/products', auth.isAuthenticated, async (req, res) => {
    const products = await ProductService.listProducts(req.query);
    res.json(products);
});

router.get('/products/:id', auth.isAuthenticated, async (req, res) => {
    const product = await ProductService.getProduct(req.params.id);
    res.json(product);
});

router.put('/products/:id', auth.isAuthenticated, async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body, req.user.id);
    res.json(product);
});

router.delete('/products/:id', auth.isAuthenticated, async (req, res) => {
    await ProductService.deleteProduct(req.params.id, req.user.id);
    res.status(204).send();
});

// Price History endpoints
router.post('/products/:id/price', auth.isAuthenticated, async (req, res) => {
    const product = await ProductService.updatePrice(req.params.id, req.body.price, req.user.id);
    res.json(product);
});

router.get('/products/:id/price-history', auth.isAuthenticated, async (req, res) => {
    const priceHistory = await ProductService.getPriceHistory(req.params.id, req.query);
    res.json(priceHistory);
});

// Inventory Management endpoints
router.post('/products/:id/inventory', auth.isAuthenticated, async (req, res) => {
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
});

router.get('/products/:id/inventory-movements', auth.isAuthenticated, async (req, res) => {
    const movements = await ProductService.getInventoryMovements(req.params.id, req.query);
    res.json(movements);
});

// Product Tags endpoints
router.post('/products/:id/tags', auth.isAuthenticated, async (req, res) => {
    const tag = await ProductService.addTag(req.params.id, req.body.name, req.user.id);
    res.json(tag);
});

router.delete('/products/:id/tags/:tagId', auth.isAuthenticated, async (req, res) => {
    await ProductService.removeTag(req.params.id, req.params.tagId);
    res.status(204).send();
});

router.get('/products/:id/tags', auth.isAuthenticated, async (req, res) => {
    const tags = await ProductService.getProductTags(req.params.id);
    res.json(tags);
});

// Order endpoints
router.post('/orders', auth.isAuthenticated, async (req, res) => {
    const order = await OrderService.createOrder(req.body, req.user.id);
    res.status(201).json(order);
});

router.get('/orders', auth.isAuthenticated, async (req, res) => {
    const orders = await OrderService.listOrders(req.query);
    res.json(orders);
});

router.get('/orders/:id', auth.isAuthenticated, async (req, res) => {
    const order = await OrderService.getOrder(req.params.id);
    res.json(order);
});

router.patch('/orders/:id/status', auth.isAuthenticated, async (req, res) => {
    const order = await OrderService.updateOrderStatus(req.params.id, req.body.status, req.user.id);
    res.json(order);
});

module.exports = router;