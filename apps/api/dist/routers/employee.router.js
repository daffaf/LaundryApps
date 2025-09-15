"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRouter = void 0;
const employee_controller_1 = require("../controllers/employee.controller");
const express_1 = require("express");
class EmployeeRouter {
    constructor() {
        this.employeeController = new employee_controller_1.EmployeeController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.employeeController.getEmployee);
        this.router.get('/:id', this.employeeController.getEmployeeById);
        this.router.post('/', this.employeeController.createEmployee);
        this.router.delete('/:id', this.employeeController.deleteEmployeeById);
        this.router.patch('/:id', this.employeeController.updateEmployeeById);
    }
    getRouter() {
        return this.router;
    }
}
exports.EmployeeRouter = EmployeeRouter;
