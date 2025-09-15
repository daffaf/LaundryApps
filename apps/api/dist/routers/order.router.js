"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRouter = void 0;
const order_controller_1 = require("../controllers/order.controller");
const token_1 = require("../middleware/token");
const express_1 = require("express");
class OrderRouter {
    constructor() {
        this.orderController = new order_controller_1.OrderController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.orderController.getOrders);
        this.router.post('/pickup', this.orderController.getNearOutlets);
        this.router.post('/pickup/create', token_1.verifyToken, this.orderController.createPickupOrder);
        this.router.post('/', this.orderController.getOrderListbyOutlet);
        this.router.post('/driver', this.orderController.driverOrderList);
        this.router.post('/payment-links', token_1.verifyToken, this.orderController.generatePaymentLink);
        this.router.post('/order', token_1.verifyToken, this.orderController.updatePaymentOrder);
        this.router.post('/completed-order', token_1.verifyToken, this.orderController.updatePaymentOrder);
        this.router.get('/:customerId', this.orderController.getOrderListCustomer);
        this.router.get('/order-data/:orderId', this.orderController.getMidtransStatus);
    }
    getRouter() {
        return this.router;
    }
}
exports.OrderRouter = OrderRouter;
