"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const employee_router_1 = require("./routers/employee.router");
const outlet_router_1 = require("./routers/outlet.router");
const items_router_1 = require("./routers/items.router");
const report_router_1 = require("./routers/report.router");
const assignment_router_1 = require("./routers/assignment.router");
const user_router_1 = require("./routers/user.router");
const location_router_1 = require("./routers/location.router");
const address_router_1 = require("./routers/address.router");
const order_router_1 = require("./routers/order.router");
const attendance_router_1 = require("./routers/attendance.router");
const worker_router_1 = require("./routers/worker.router");
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("./prisma"));
const path_1 = __importDefault(require("path"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
        this.handleError();
        this.privateSetupCron();
    }
    configure() {
        this.app.use((0, cors_1.default)());
        this.app.use((0, express_1.json)());
        this.app.use((0, express_1.urlencoded)({ extended: true }));
        this.app.use('/api/public', express_1.default.static(path_1.default.join(__dirname, '../public/')));
    }
    getApp() {
        return this.app;
    }
    handleError() {
        this.app.use((req, res, next) => {
            if (req.path.includes('/api/')) {
                res.status(404).send('Not found !');
            }
            else {
                next();
            }
        });
        this.app.use((err, req, res, next) => {
            if (req.path.includes('/api/')) {
                console.error('Error : ', err.stack);
                res.status(500).send('Error !');
            }
            else {
                next();
            }
        });
    }
    routes() {
        const employeeRouter = new employee_router_1.EmployeeRouter();
        const outletRouter = new outlet_router_1.OutletRouter();
        const itemsRouter = new items_router_1.ItemsRouter();
        const reportRouter = new report_router_1.ReportRouter();
        const assignmentRouter = new assignment_router_1.AssignmentRouter();
        const authRouter = new user_router_1.UserRouter();
        const locationRouter = new location_router_1.LocationRouter();
        const addressRouter = new address_router_1.AddressRouter();
        const orderRouter = new order_router_1.OrderRouter();
        const attendanceRouter = new attendance_router_1.AttendanceRouter();
        const workerRouter = new worker_router_1.WorkerRouter();
        this.app.get('/', (req, res) => {
            res.send(`Starting...`);
        });
        this.app.get('/api', (req, res) => {
            res.send(`Hello, API is Working!`);
        });
        this.app.use('/api/employee', employeeRouter.getRouter());
        this.app.use('/api/outlet', outletRouter.getRouter());
        this.app.use('/api/items', itemsRouter.getRouter());
        this.app.use('/api/order', orderRouter.getRouter());
        this.app.use('/api/report', reportRouter.getRouter());
        this.app.use('/api/assignment', assignmentRouter.getRouter());
        this.app.use('/api/users', authRouter.getRouter());
        this.app.use('/api/location', locationRouter.getRouter());
        this.app.use('/api/addresses', addressRouter.getRouter());
        this.app.use('/api/orders', orderRouter.getRouter());
        this.app.use('/api/submit', attendanceRouter.getRouter());
        this.app.use('/api/worker', workerRouter.getRouter());
    }
    privateSetupCron() {
        node_cron_1.default.schedule('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Running Cron Job auto confirmation');
            try {
                const thresholdDate = new Date();
                thresholdDate.setHours(thresholdDate.getHours() - 48);
                yield prisma_1.default.order.updateMany({
                    where: {
                        status: 'sedangDikirim',
                        deliverDate: thresholdDate,
                    },
                    data: {
                        status: 'selesai',
                    },
                });
                console.log('Auto-confirmation job completed successfully.');
            }
            catch (error) {
                console.error('Error in auto-confirmation job:', error);
            }
        }));
    }
}
/// Create instance
// const appInstance = new App();
// 🚀 Export the express app (for Vercel)
exports.default = App; // ekspor Express instance langsung
// // 🚀 If running locally, start server
// if (process.env.NODE_ENV !== 'production') {
// }
