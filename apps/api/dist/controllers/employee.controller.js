"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = require("bcrypt");
var Role;
(function (Role) {
    Role["superAdmin"] = "superAdmin";
    Role["outletAdmin"] = "outletAdmin";
    Role["worker"] = "worker";
    Role["driver"] = "driver";
    Role["customer"] = "customer";
})(Role || (Role = {}));
class EmployeeController {
    constructor() {
        this.updateEmployeeById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { role, outletId, station } = req.body;
            try {
                const existingEmployee = yield prisma_1.default.employee.findUnique({
                    where: { employeeId: Number(id) },
                    include: { worker: true, driver: true, outletAdmin: true },
                });
                if (!existingEmployee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }
                if (role !== existingEmployee.role) {
                    if (existingEmployee.role === 'worker' && existingEmployee.worker) {
                        yield prisma_1.default.worker.delete({
                            where: { workerId: existingEmployee.worker.workerId },
                        });
                    }
                    else if (existingEmployee.role === 'driver' &&
                        existingEmployee.driver) {
                        yield prisma_1.default.driver.delete({
                            where: { driverId: existingEmployee.driver.driverId },
                        });
                    }
                    else if (existingEmployee.role === 'outletAdmin' &&
                        existingEmployee.outletAdmin) {
                        yield prisma_1.default.outletAdmin.delete({
                            where: {
                                outletAdminId: existingEmployee.outletAdmin.outletAdminId,
                            },
                        });
                    }
                    if (role === 'worker') {
                        if (!station) {
                            return res
                                .status(400)
                                .json({ message: 'Station is required for workers' });
                        }
                        yield prisma_1.default.worker.create({
                            data: {
                                station,
                                employeeId: existingEmployee.employeeId,
                            },
                        });
                    }
                    else if (role === 'driver') {
                        yield prisma_1.default.driver.create({
                            data: {
                                isAvailable: false,
                                employeeId: existingEmployee.employeeId,
                            },
                        });
                    }
                    else if (role === 'outletAdmin') {
                        yield prisma_1.default.outletAdmin.create({
                            data: {
                                isAvailable: false,
                                employeeId: existingEmployee.employeeId,
                            },
                        });
                    }
                }
                else if (role === 'worker' && station && existingEmployee.worker) {
                    yield prisma_1.default.worker.update({
                        where: { workerId: existingEmployee.worker.workerId },
                        data: { station },
                    });
                }
                const updatedEmployee = yield prisma_1.default.employee.update({
                    where: { employeeId: Number(id) },
                    data: {
                        role,
                        outletId,
                    },
                });
                res.status(200).json({
                    message: 'Employee updated successfully',
                    employee: updatedEmployee,
                });
            }
            catch (_a) {
                console.error('Error updating employee:');
                res.status(500).json({ message: 'Error updating employee' });
            }
        });
        this.deleteEmployeeById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const employee = yield prisma_1.default.employee.findUnique({
                    where: { employeeId: Number(id) },
                    include: { worker: true, driver: true },
                });
                if (!employee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }
                if (employee.role === 'worker' && employee.worker) {
                    yield prisma_1.default.worker.delete({
                        where: { workerId: employee.worker.workerId },
                    });
                }
                else if (employee.role === 'driver' && employee.driver) {
                    yield prisma_1.default.driver.delete({
                        where: { driverId: employee.driver.driverId },
                    });
                }
                yield prisma_1.default.employee.delete({
                    where: { employeeId: Number(id) },
                });
                res.status(200).json({ message: 'Employee deleted successfully' });
            }
            catch (_a) {
                console.error('Error deleting employee:');
                res.status(500).json({ message: 'Error deleting employee' });
            }
        });
    }
    getEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const sortBy = req.query.sortBy === 'desc' ? 'desc' : 'asc';
                const roleFilter = req.query.role ? req.query.role : undefined;
                const outletIdFilter = req.query.outletId
                    ? parseInt(req.query.outletId)
                    : undefined;
                const employeeData = yield prisma_1.default.employee.findMany({
                    skip,
                    take: limit,
                    orderBy: {
                        employeeId: sortBy,
                    },
                    where: Object.assign(Object.assign({}, (roleFilter && {
                        role: roleFilter,
                    })), (outletIdFilter && {
                        outletId: outletIdFilter,
                    })),
                    include: {
                        outlet: { select: { name: true } },
                        worker: { select: { station: true } },
                    },
                });
                const totalEmployees = yield prisma_1.default.employee.count({
                    where: Object.assign(Object.assign({}, (roleFilter && {
                        role: roleFilter,
                    })), (outletIdFilter && {
                        outletId: outletIdFilter,
                    })),
                });
                const totalPages = Math.ceil(totalEmployees / limit);
                return res.status(200).json({
                    data: employeeData,
                    pagination: {
                        totalItems: totalEmployees,
                        totalPages,
                        currentPage: page,
                        pageSize: limit,
                    },
                });
            }
            catch (error) {
                console.error('Error fetching employees:', error);
                return res.status(500).json({ error: 'Failed to fetch employees' });
            }
        });
    }
    getEmployeeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const employee = yield prisma_1.default.employee.findUnique({
                where: { employeeId: Number(id) },
            });
            if (!employee) {
                return res.send(404);
            }
            return res.status(200).send(employee);
        });
    }
    createEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, fullName, role, outletId, station } = req.body;
            try {
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashedPassword = yield (0, bcrypt_1.hash)(password, salt);
                const newEmployeeData = yield prisma_1.default.employee.create({
                    data: { email, password: hashedPassword, fullName, role, outletId },
                });
                if (role === 'worker') {
                    yield prisma_1.default.worker.create({
                        data: {
                            station: station || 'washing',
                            employeeId: newEmployeeData.employeeId,
                        },
                    });
                }
                else if (role === 'driver') {
                    yield prisma_1.default.driver.create({
                        data: {
                            isAvailable: false,
                            employeeId: newEmployeeData.employeeId,
                        },
                    });
                }
                else if (role === 'outletAdmin') {
                    yield prisma_1.default.outletAdmin.create({
                        data: {
                            isAvailable: false,
                            employeeId: newEmployeeData.employeeId,
                        },
                    });
                }
                return res.status(201).send(newEmployeeData);
            }
            catch (err) {
                res.status(400).send({
                    status: 'error',
                    msg: err,
                });
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
console.log('Hello');
