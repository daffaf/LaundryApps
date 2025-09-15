"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerRouter = void 0;
const worker_controller_1 = require("../controllers/worker.controller");
const express_1 = require("express");
class WorkerRouter {
    constructor() {
        this.workerController = new worker_controller_1.WorkerController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', this.workerController.getDataByEmployeeId);
    }
    getRouter() {
        return this.router;
    }
}
exports.WorkerRouter = WorkerRouter;
