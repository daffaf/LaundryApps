"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsRouter = void 0;
const items_controller_1 = require("../controllers/items.controller");
const express_1 = require("express");
class ItemsRouter {
    constructor() {
        this.itemsController = new items_controller_1.ItemsController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.itemsController.getItems);
        this.router.get('/:id', this.itemsController.getItemById);
        this.router.post('/', this.itemsController.createitem);
        this.router.delete('/:id', this.itemsController.deleteItemById);
        this.router.patch('/:id', this.itemsController.updateItemById);
    }
    getRouter() {
        return this.router;
    }
}
exports.ItemsRouter = ItemsRouter;
