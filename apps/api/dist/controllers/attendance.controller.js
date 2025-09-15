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
exports.AttendanceController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AttendanceController {
    submitAttendanceIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { employeeId } = req.body;
            try {
                const today = new Date();
                const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                const endOfDay = new Date(today.setHours(23, 59, 59, 999));
                const existingAttendance = yield prisma_1.default.attendance.findFirst({
                    where: {
                        employeeId,
                        clockIn: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                });
                let attendance;
                if (existingAttendance) {
                    attendance = yield prisma_1.default.attendance.update({
                        where: { attendanceId: existingAttendance.attendanceId },
                        data: { clockIn: new Date() },
                    });
                }
                else {
                    attendance = yield prisma_1.default.attendance.create({
                        data: {
                            employeeId,
                            clockIn: new Date(),
                            clockOut: null,
                        },
                    });
                }
                const driver = yield prisma_1.default.driver.findUnique({
                    where: { employeeId },
                });
                if (driver) {
                    yield prisma_1.default.driver.update({
                        where: { driverId: driver.driverId },
                        data: { isAvailable: true },
                    });
                }
                res.status(200).json(attendance);
            }
            catch (err) {
                res.status(400).json({ error: 'Failed to record clock-in time', details: err });
            }
        });
    }
    submitAttendanceOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { employeeId } = req.body;
            try {
                const today = new Date();
                const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                const endOfDay = new Date(today.setHours(23, 59, 59, 999));
                // Find the clock-in record for today to add clock-out time
                const existingAttendance = yield prisma_1.default.attendance.findFirst({
                    where: {
                        employeeId,
                        clockIn: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                });
                if (!existingAttendance) {
                    res.status(404).json({ error: 'Clock-in record not found for today' });
                    return;
                }
                // Update the existing entry with clock-out time
                const attendance = yield prisma_1.default.attendance.update({
                    where: { attendanceId: existingAttendance.attendanceId },
                    data: { clockOut: new Date() },
                });
                const driver = yield prisma_1.default.driver.findUnique({
                    where: { employeeId },
                });
                if (driver) {
                    yield prisma_1.default.driver.update({
                        where: { driverId: driver.driverId },
                        data: { isAvailable: false },
                    });
                }
                res.status(200).json(attendance);
            }
            catch (err) {
                res.status(400).json({ error: 'Failed to record clock-out time', details: err });
            }
        });
    }
    getAttendanceLog(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { employeeId } = req.params;
            if (isNaN(parseInt(employeeId, 10))) {
                return res.status(400).json({ error: 'Invalid employee ID' });
            }
            try {
                const attendanceLog = yield prisma_1.default.attendance.findMany({
                    where: { employeeId: parseInt(employeeId, 10) },
                    orderBy: { clockIn: 'desc' },
                });
                if (attendanceLog.length === 0) {
                    return res.status(404).json({ error: 'No attendance records found for this employee.' });
                }
                res.status(200).json(attendanceLog);
            }
            catch (err) {
                console.error('Error fetching attendance log:', err);
                const errorMessage = (err === null || err === void 0 ? void 0 : err.message) || 'An unknown error occurred';
                res.status(500).json({ error: 'Failed to retrieve attendance log', details: errorMessage });
            }
        });
    }
    getAllAttendanceLogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const attendanceLogs = yield prisma_1.default.attendance.findMany({
                    include: {
                        employee: {
                            select: {
                                fullName: true
                            }
                        }
                    },
                    orderBy: { clockIn: 'desc' },
                });
                if (attendanceLogs.length === 0) {
                    return res.status(404).json({ error: 'No attendance records found.' });
                }
                res.status(200).json(attendanceLogs);
            }
            catch (err) {
                console.error('Error fetching all attendance logs:', err);
                const errorMessage = (err === null || err === void 0 ? void 0 : err.message) || 'An unknown error occurred';
                res.status(500).json({ error: 'Failed to retrieve all attendance logs', details: errorMessage });
            }
        });
    }
}
exports.AttendanceController = AttendanceController;
