"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentRouter = void 0;
const assignment_controller_1 = require("../controllers/assignment.controller");
const express_1 = require("express");
class AssignmentRouter {
    constructor() {
        this.assignmentController = new assignment_controller_1.AssignmentController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/order-confirmation/:outletId', this.assignmentController.orderConfirmation);
        this.router.get('/item-input/:outletAdminId', this.assignmentController.itemInput);
        this.router.patch('/confirm-order/:orderId', this.assignmentController.confirmOrder);
        this.router.post('/item-submit', this.assignmentController.itemSubmit);
        this.router.get('/bypass-request/:outletId', this.assignmentController.bypassRequest);
        this.router.patch('/confirm-bypass/:orderId', this.assignmentController.confirmBypass);
        this.router.get('/get-pickup/:outletId', this.assignmentController.getPickup);
        this.router.post('/confirm-pickup', this.assignmentController.confirmPickup);
        this.router.get('/get-delivery/:outletId', this.assignmentController.getDelivery);
        this.router.post('/confirm-delivery', this.assignmentController.confirmDelivery);
        this.router.get('/on-the-way/:driverId', this.assignmentController.getOnPickup);
        this.router.patch('/receive-item', this.assignmentController.receiveItem);
        this.router.patch('/complete-pickup', this.assignmentController.completePickup);
        this.router.patch('/complete-delivery', this.assignmentController.completeDelivery);
        this.router.get('/driver-availability/:driverId', this.assignmentController.getDriverAvailability);
        this.router.get('/get-task/:status/:outletId', this.assignmentController.getTask);
        this.router.patch('/submit-bypass/:orderId', this.assignmentController.submitBypass);
        this.router.patch('/submit-task/:orderId', this.assignmentController.submitTask);
        this.router.get('/driver/history/:driverId', this.assignmentController.getDriverJobHistory);
        this.router.get('/outletadmin/history/:outletAdminId', this.assignmentController.getOutletAdminJobHistory);
        this.router.get('/worker/history/:workerId', this.assignmentController.getWorkerJobHistory);
    }
    getRouter() {
        return this.router;
    }
}
exports.AssignmentRouter = AssignmentRouter;
