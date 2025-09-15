"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRouter = void 0;
const address_controller_1 = require("../controllers/address.controller");
const token_1 = require("../middleware/token");
const express_1 = require("express");
class AddressRouter {
    constructor() {
        this.addressController = new address_controller_1.AddressController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', token_1.verifyToken, this.addressController.createAddress);
        this.router.get('/:customerId', this.addressController.getUserAddress);
        this.router.post('/primary', token_1.verifyToken, this.addressController.mainAddress);
        this.router.delete('/:addressId', this.addressController.deleteAddress);
    }
    getRouter() {
        return this.router;
    }
}
exports.AddressRouter = AddressRouter;
