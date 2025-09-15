"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRouter = void 0;
const attendance_controller_1 = require("../controllers/attendance.controller");
const express_1 = require("express");
class AttendanceRouter {
    constructor() {
        this.attendanceController = new attendance_controller_1.AttendanceController();
        this.router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this.router.post('/attendance', this.attendanceController.submitAttendanceIn);
        this.router.put('/attendance', this.attendanceController.submitAttendanceOut);
        this.router.get('/attendance/:employeeId', this.attendanceController.getAttendanceLog);
        this.router.get('/attendance', this.attendanceController.getAllAttendanceLogs);
    }
    getRouter() {
        return this.router;
    }
}
exports.AttendanceRouter = AttendanceRouter;
