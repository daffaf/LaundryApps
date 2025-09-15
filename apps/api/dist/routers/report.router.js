"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRouter = void 0;
const report_controller_1 = require("../controllers/report.controller");
const express_1 = require("express");
class ReportRouter {
    constructor() {
        this.reportController = new report_controller_1.ReportController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.reportController.getIncomeData);
        this.router.get('/workers', this.reportController.getWorkersPerformance);
        this.router.get('/drivers', this.reportController.getDriversPerformance);
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportRouter = ReportRouter;
