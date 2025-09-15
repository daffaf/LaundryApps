"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletRouter = void 0;
const outlet_controller_1 = require("../controllers/outlet.controller");
const express_1 = require("express");
class OutletRouter {
    constructor() {
        this.outletController = new outlet_controller_1.OutletController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.outletController.getOutlet);
        this.router.get('/:id', this.outletController.getOutletById);
        this.router.post('/', this.outletController.createOutlet);
        this.router.delete('/:id', this.outletController.deleteOutletById);
        this.router.patch('/:id', this.outletController.updateOutletyId);
    }
    getRouter() {
        return this.router;
    }
}
exports.OutletRouter = OutletRouter;
