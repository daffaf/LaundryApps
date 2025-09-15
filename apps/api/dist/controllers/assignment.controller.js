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
exports.AssignmentController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AssignmentController {
    orderConfirmation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletId } = req.params;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        outletId: parseInt(outletId),
                        status: 'menungguKonfirmasi',
                    },
                    include: {
                        customer: true,
                        items: true,
                        customerAddress: { select: { detailAddress: true } },
                    },
                });
                res.json(orders);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    confirmOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId } = req.params;
            const { outletAdminId } = req.body;
            try {
                yield prisma_1.default.order.update({
                    where: { orderId: parseInt(orderId) },
                    data: {
                        outletAdminId: outletAdminId,
                        status: 'menungguPenjemputanDriver',
                    },
                });
                return res.status(200).json({ message: 'Order confirmed' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to patch order' });
            }
        });
    }
    pickupRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletId } = req.params;
            try {
                yield prisma_1.default.order.findMany({
                    where: {
                        outletId: parseInt(outletId),
                        status: 'menungguPenjemputanDriver',
                    },
                    include: { customerAddress: { select: { detailAddress: true } } },
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to patch order' });
            }
        });
    }
    itemInput(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletAdminId } = req.params;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        outletAdminId: parseInt(outletAdminId),
                        status: 'laundrySampaiOutlet',
                    },
                    include: {
                        customer: true,
                        items: true,
                    },
                });
                res.json(orders);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    itemSubmit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { items, weight, orderId, pricePerKg } = req.body;
            const totalPrice = weight * pricePerKg;
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Invalid items format' });
            }
            if (!orderId) {
                return res.status(400).json({ error: 'Missing orderId' });
            }
            try {
                yield prisma_1.default.order.update({
                    where: { orderId },
                    data: { weight, status: 'pencucian', totalPrice },
                });
                const createdItems = yield Promise.all(items.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const { item: itemName, quantity } = item;
                    return yield prisma_1.default.items.create({
                        data: {
                            orderId,
                            item: itemName,
                            quantity,
                        },
                    });
                })));
                return res.status(201).json({
                    message: 'Items have been added and weight updated successfully',
                    data: createdItems,
                });
            }
            catch (error) {
                console.error('Error creating items or updating weight:', error);
                return res
                    .status(500)
                    .json({ error: 'Failed to create items or update weight' });
            }
        });
    }
    bypassRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletId } = req.params;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        outletId: parseInt(outletId),
                        bypassMessage: { not: null },
                    },
                    include: {
                        items: true,
                    },
                });
                return res.json(orders);
            }
            catch (error) {
                console.error('Error fetching orders:', error);
                return res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    confirmBypass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId } = req.params;
            const { status, action, paymentStatus } = req.body;
            let newStatus;
            if (action === 'reject') {
                newStatus = status;
            }
            else if (action === 'confirm') {
                if (status === 'pencucian') {
                    newStatus = 'penyetrikaan';
                }
                else if (status === 'penyetrikaan') {
                    newStatus = 'packing';
                }
                else if (status === 'packing') {
                    if (paymentStatus === 'paid') {
                        newStatus = 'siapDiantar';
                    }
                    else {
                        newStatus = 'menungguPembayaran';
                    }
                }
            }
            try {
                yield prisma_1.default.order.update({
                    where: { orderId: parseInt(orderId) },
                    data: { status: newStatus, bypassMessage: null },
                });
                return res.status(200).json({ message: 'Order confirmed' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to patch order' });
            }
        });
    }
    getPickup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletId } = req.params;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        outletId: parseInt(outletId),
                        status: 'menungguPenjemputanDriver',
                        drivers: {
                            none: {},
                        },
                    },
                    include: {
                        customerAddress: { select: { detailAddress: true } },
                        customer: true,
                        items: true,
                    },
                });
                res.json(orders);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    confirmPickup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId, driverId } = req.body;
            try {
                yield prisma_1.default.$transaction([
                    prisma_1.default.driversOnOrders.create({
                        data: { driverId, orderId, activity: 'pickUp' },
                    }),
                    prisma_1.default.driver.update({
                        where: { driverId: driverId },
                        data: { isAvailable: false },
                    }),
                ]);
                return res.status(200).json({ message: 'pickup confirmed' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to pickup order' });
            }
        });
    }
    getDelivery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletId } = req.params;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        outletId: parseInt(outletId),
                        status: 'siapDiantar',
                    },
                    include: {
                        customer: true,
                        items: true,
                        customerAddress: { select: { detailAddress: true } },
                        drivers: true,
                    },
                });
                const filteredOrders = orders.filter((order) => order.drivers.length === 1);
                res.json(filteredOrders);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    confirmDelivery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId, driverId } = req.body;
            try {
                yield prisma_1.default.$transaction([
                    prisma_1.default.driversOnOrders.create({
                        data: { orderId, driverId, activity: 'delivery' },
                    }),
                    prisma_1.default.order.update({
                        where: { orderId },
                        data: { status: 'sedangDikirim' },
                    }),
                    prisma_1.default.driver.update({
                        where: { driverId: driverId },
                        data: { isAvailable: false },
                    }),
                ]);
                return res.status(200).json({ message: 'delivery confirmed' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to delivery order' });
            }
        });
    }
    getOnPickup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { driverId } = req.params;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        status: {
                            in: [
                                'menungguPenjemputanDriver',
                                'laundryMenujuOutlet',
                                'sedangDikirim',
                            ],
                        },
                        drivers: {
                            some: {
                                driverId: parseInt(driverId),
                            },
                        },
                    },
                    include: {
                        customerAddress: { select: { detailAddress: true } },
                        drivers: true,
                    },
                });
                res.status(200).json(orders);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    receiveItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId } = req.body;
            try {
                yield prisma_1.default.order.update({
                    where: { orderId: orderId },
                    data: { status: 'laundryMenujuOutlet' },
                });
                return res.status(200).json({ message: 'Laundry items reveived' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to receive laundry items' });
            }
        });
    }
    completePickup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId, driverId } = req.body;
            try {
                yield prisma_1.default.$transaction([
                    prisma_1.default.order.update({
                        where: { orderId: orderId },
                        data: { status: 'laundrySampaiOutlet' },
                    }),
                    prisma_1.default.driver.update({
                        where: { driverId: driverId },
                        data: { isAvailable: true },
                    }),
                ]);
                return res.status(200).json({ message: 'Laundry arrived at outlet' });
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to complete pickup' });
            }
        });
    }
    completeDelivery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { driverId, orderId } = req.body;
            try {
                yield prisma_1.default.$transaction([
                    prisma_1.default.order.update({
                        where: { orderId: orderId },
                        data: { status: 'terkirim' },
                    }),
                    prisma_1.default.driver.update({
                        where: { driverId: driverId },
                        data: { isAvailable: true },
                    }),
                ]);
                return res.status(200).json({ message: 'Delivered to customer' });
            }
            catch (error) {
                res.status(500).json({ error: 'Delivery completion failed' });
            }
        });
    }
    getDriverAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { driverId } = req.params;
            try {
                const data = yield prisma_1.default.driver.findUnique({
                    where: { driverId: parseInt(driverId) },
                });
                return res.status(200).send(data);
            }
            catch (error) {
                res.status(500).json({ error: 'GET driver availability failed' });
            }
        });
    }
    getTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, outletId } = req.params;
                let orderStatus;
                if (status === 'washing')
                    orderStatus = 'pencucian';
                else if (status === 'ironing')
                    orderStatus = 'penyetrikaan';
                else if (status === 'packing')
                    orderStatus = 'packing';
                if (!orderStatus) {
                    return res.status(400).json({ error: 'Invalid status value' });
                }
                const outletIdInt = parseInt(outletId, 10);
                if (isNaN(outletIdInt)) {
                    return res.status(400).json({ error: 'Invalid outletId value' });
                }
                const order = yield prisma_1.default.order.findFirst({
                    where: {
                        status: orderStatus,
                        outletId: outletIdInt,
                        bypassMessage: null,
                    },
                    include: {
                        items: true,
                    },
                    orderBy: { orderId: 'asc' },
                });
                res.json(order);
            }
            catch (error) {
                res.status(500).json({ error: 'Server error' });
            }
        });
    }
    submitBypass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId } = req.params;
            const { bypassMessage, workerId } = req.body;
            try {
                yield prisma_1.default.$transaction([
                    prisma_1.default.order.update({
                        where: { orderId: parseInt(orderId) },
                        data: { bypassMessage },
                    }),
                    prisma_1.default.workersOnOrders.create({
                        data: { workerId: workerId, orderId: parseInt(orderId) },
                    }),
                ]);
                return res.status(200).json({ message: 'Bypass message updated' });
            }
            catch (error) {
                console.error('Error in submitBypass:', error);
                return res.status(500).json({
                    error: 'Failed to update the bypass message',
                });
            }
        });
    }
    submitTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId } = req.params;
            const { workerId, status, paymentStatus } = req.body;
            const parsedOrderId = parseInt(orderId);
            const parsedWorkerId = parseInt(workerId);
            try {
                let newStatus;
                switch (status) {
                    case 'pencucian':
                        newStatus = 'penyetrikaan';
                        break;
                    case 'penyetrikaan':
                        newStatus = 'packing';
                        break;
                    case 'packing':
                        if (paymentStatus === 'paid') {
                            newStatus = 'siapDiantar';
                        }
                        else {
                            newStatus = 'menungguPembayaran';
                        }
                        break;
                    default:
                        return res.status(400).json({ error: 'Invalid status value' });
                }
                try {
                    yield prisma_1.default.workersOnOrders.create({
                        data: { workerId: parsedWorkerId, orderId: parsedOrderId },
                    });
                }
                catch (checker) {
                    console.warn('Failed to create worker-on-order association (possibly already exists):', checker);
                }
                yield prisma_1.default.order.update({
                    where: { orderId: parsedOrderId },
                    data: { status: newStatus },
                });
                return res.status(200).json({
                    message: 'Task submitted successfully',
                });
            }
            catch (error) {
                console.error('Error in submitTask:', error);
                return res.status(500).json({
                    error: 'Failed to submit task',
                });
            }
        });
    }
    getDriverJobHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { driverId } = req.params;
            try {
                const jobHistory = yield prisma_1.default.driversOnOrders.findMany({
                    where: {
                        driverId: parseInt(driverId),
                        OR: [
                            { order: { status: 'laundrySampaiOutlet' } },
                            { order: { status: 'selesai' } },
                        ],
                    },
                    include: {
                        order: {
                            select: {
                                orderId: true,
                                createdAt: true,
                                customer: {
                                    select: { fullName: true },
                                },
                                customerAddress: {
                                    select: { detailAddress: true },
                                },
                            },
                        },
                    },
                    orderBy: {
                        order: {
                            createdAt: 'desc',
                        },
                    },
                });
                res.status(200).json(jobHistory);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch driver job history' });
            }
        });
    }
    getOutletAdminJobHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { outletAdminId } = req.params;
            try {
                const jobHistory = yield prisma_1.default.order.findMany({
                    where: {
                        outletAdminId: parseInt(outletAdminId),
                        status: 'selesai',
                    },
                    include: {
                        customer: {
                            select: { fullName: true },
                        },
                        customerAddress: {
                            select: { detailAddress: true },
                        },
                        items: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                res.status(200).json(jobHistory);
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ error: 'Failed to fetch outlet admin job history' });
            }
        });
    }
    getWorkerJobHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workerId } = req.params;
            try {
                const jobHistory = yield prisma_1.default.workersOnOrders.findMany({
                    where: {
                        workerId: parseInt(workerId),
                    },
                    include: {
                        order: {
                            select: {
                                orderId: true,
                                customer: {
                                    select: { fullName: true },
                                },
                            },
                        },
                        worker: {
                            select: {
                                station: true,
                                workerId: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                res.status(200).json(jobHistory);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch worker job history' });
            }
        });
    }
}
exports.AssignmentController = AssignmentController;
