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
exports.ReportController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const date_fns_1 = require("date-fns");
class ReportController {
    getIncomeData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId, startDate, endDate, rangeType } = req.query;
                const parsedStartDate = startDate
                    ? new Date(startDate)
                    : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                let fromDate;
                let toDate;
                switch (rangeType) {
                    case 'daily':
                        fromDate = parsedStartDate
                            ? (0, date_fns_1.startOfDay)(parsedStartDate)
                            : (0, date_fns_1.startOfMonth)(new Date());
                        toDate = parsedEndDate
                            ? (0, date_fns_1.endOfDay)(parsedEndDate)
                            : (0, date_fns_1.endOfMonth)(new Date());
                        break;
                    case 'monthly':
                        fromDate = (0, date_fns_1.startOfYear)(parsedStartDate || new Date());
                        toDate = (0, date_fns_1.endOfYear)(parsedEndDate || new Date());
                        break;
                    case 'annual':
                        fromDate = (0, date_fns_1.startOfDecade)(parsedStartDate || new Date());
                        toDate = (0, date_fns_1.endOfDecade)(parsedEndDate || new Date());
                        break;
                    default:
                        fromDate = parsedStartDate;
                        toDate = parsedEndDate;
                }
                const orders = yield prisma_1.default.order.findMany({
                    where: Object.assign(Object.assign({}, (outletId && { outletId: parseInt(outletId) })), { createdAt: {
                            gte: fromDate,
                            lte: toDate,
                        }, paymentStatus: 'paid' }),
                    select: {
                        createdAt: true,
                        totalPrice: true,
                    },
                });
                const incomeData = orders.reduce((acc, order) => {
                    let dateKey;
                    if (rangeType === 'daily') {
                        dateKey = order.createdAt.toISOString().split('T')[0];
                    }
                    else if (rangeType === 'monthly') {
                        const [year, month] = order.createdAt
                            .toISOString()
                            .split('T')[0]
                            .split('-');
                        dateKey = `${year}-${month}`;
                    }
                    else if (rangeType === 'annual') {
                        dateKey = order.createdAt.getFullYear().toString();
                    }
                    else {
                        dateKey = order.createdAt.toISOString().split('T')[0];
                    }
                    if (!acc[dateKey]) {
                        acc[dateKey] = { date: dateKey, totalIncome: 0 };
                    }
                    acc[dateKey].totalIncome += order.totalPrice || 0;
                    return acc;
                }, {});
                const formattedIncomeData = Object.values(incomeData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                res.status(200).json({ data: formattedIncomeData });
            }
            catch (error) {
                console.error('Error fetching income data:', error);
                res.status(500).json({ error: 'Failed to fetch income data' });
            }
        });
    }
    getWorkersPerformance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, rangeType, outletId } = req.query;
                const parsedStartDate = startDate
                    ? new Date(startDate)
                    : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                let fromDate;
                let toDate;
                switch (rangeType) {
                    case 'daily':
                        fromDate = parsedStartDate
                            ? (0, date_fns_1.startOfDay)(parsedStartDate)
                            : (0, date_fns_1.startOfMonth)(new Date());
                        toDate = parsedEndDate
                            ? (0, date_fns_1.endOfDay)(parsedEndDate)
                            : (0, date_fns_1.endOfMonth)(new Date());
                        break;
                    case 'monthly':
                        fromDate = (0, date_fns_1.startOfYear)(parsedStartDate || new Date());
                        toDate = (0, date_fns_1.endOfYear)(parsedEndDate || new Date());
                        break;
                    case 'annual':
                        fromDate = (0, date_fns_1.startOfDecade)(parsedStartDate || new Date());
                        toDate = (0, date_fns_1.endOfDecade)(parsedEndDate || new Date());
                        break;
                    default:
                        fromDate = parsedStartDate;
                        toDate = parsedEndDate;
                }
                const data = yield prisma_1.default.worker.findMany({
                    where: {
                        employee: {
                            outletId: outletId ? parseInt(outletId) : undefined,
                        },
                    },
                    select: {
                        employeeId: true,
                        employee: { select: { fullName: true } },
                        orders: {
                            select: {
                                createdAt: true,
                            },
                            where: {
                                createdAt: {
                                    gte: fromDate,
                                    lte: toDate,
                                },
                            },
                        },
                    },
                });
                const result = data.map((worker) => {
                    const countByDate = worker.orders.reduce((acc, order) => {
                        let dateKey;
                        if (rangeType === 'daily') {
                            dateKey = order.createdAt.toISOString().split('T')[0];
                        }
                        else if (rangeType === 'monthly') {
                            const [year, month] = order.createdAt
                                .toISOString()
                                .split('T')[0]
                                .split('-');
                            dateKey = `${year}-${month}`;
                        }
                        else if (rangeType === 'annual') {
                            dateKey = order.createdAt.getFullYear().toString();
                        }
                        else {
                            dateKey = order.createdAt.toISOString().split('T')[0];
                        }
                        acc[dateKey] = (acc[dateKey] || 0) + 1;
                        return acc;
                    }, {});
                    return {
                        employeeId: worker.employeeId,
                        employeeName: worker.employee.fullName,
                        counts: Object.entries(countByDate).map(([date, count]) => ({
                            date,
                            count,
                        })),
                    };
                });
                res.json(result);
            }
            catch (error) {
                console.error('Error fetching worker performance:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    getDriversPerformance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, rangeType, outletId } = req.query;
                const parsedStartDate = startDate
                    ? new Date(startDate)
                    : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                let fromDate;
                let toDate;
                switch (rangeType) {
                    case 'daily':
                        fromDate = parsedStartDate
                            ? (0, date_fns_1.startOfDay)(parsedStartDate)
                            : (0, date_fns_1.startOfMonth)(new Date());
                        toDate = parsedEndDate
                            ? (0, date_fns_1.endOfDay)(parsedEndDate)
                            : (0, date_fns_1.endOfMonth)(new Date());
                        break;
                    case 'monthly':
                        fromDate = (0, date_fns_1.startOfYear)(parsedStartDate || new Date());
                        toDate = (0, date_fns_1.endOfYear)(parsedEndDate || new Date());
                        break;
                    case 'annual':
                        fromDate = (0, date_fns_1.startOfDecade)(parsedStartDate || new Date());
                        toDate = (0, date_fns_1.endOfDecade)(parsedEndDate || new Date());
                        break;
                    default:
                        fromDate = parsedStartDate;
                        toDate = parsedEndDate;
                }
                const data = yield prisma_1.default.driver.findMany({
                    where: {
                        employee: {
                            outletId: outletId ? parseInt(outletId) : undefined,
                        },
                    },
                    select: {
                        employeeId: true,
                        employee: { select: { fullName: true } },
                        orders: {
                            select: {
                                createdAt: true,
                            },
                            where: {
                                createdAt: {
                                    gte: fromDate,
                                    lte: toDate,
                                },
                            },
                        },
                    },
                });
                const result = data.map((worker) => {
                    const countByDate = worker.orders.reduce((acc, order) => {
                        let dateKey;
                        if (rangeType === 'daily') {
                            dateKey = order.createdAt.toISOString().split('T')[0];
                        }
                        else if (rangeType === 'monthly') {
                            const [year, month] = order.createdAt
                                .toISOString()
                                .split('T')[0]
                                .split('-');
                            dateKey = `${year}-${month}`;
                        }
                        else if (rangeType === 'annual') {
                            dateKey = order.createdAt.getFullYear().toString();
                        }
                        else {
                            dateKey = order.createdAt.toISOString().split('T')[0];
                        }
                        acc[dateKey] = (acc[dateKey] || 0) + 1;
                        return acc;
                    }, {});
                    return {
                        employeeId: worker.employeeId,
                        employeeName: worker.employee.fullName,
                        counts: Object.entries(countByDate).map(([date, count]) => ({
                            date,
                            count,
                        })),
                    };
                });
                res.json(result);
            }
            catch (error) {
                console.error('Error fetching worker performance:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.ReportController = ReportController;
