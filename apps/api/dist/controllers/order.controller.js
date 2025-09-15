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
exports.OrderController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const geolib_1 = require("geolib");
const helper_1 = require("../services/helper");
class OrderController {
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const sortOrder = req.query.sortBy === 'desc' ? 'desc' : 'asc';
                const orderIdFilter = req.query.orderId
                    ? parseInt(req.query.orderId)
                    : undefined;
                const outletIdFilter = req.query.outletId
                    ? parseInt(req.query.outletId)
                    : undefined;
                const statusFilter = req.query.status;
                const paymentStatusFilter = req.query.paymentStatus;
                const customerIdFilter = req.query.customerId
                    ? parseInt(req.query.customerId)
                    : undefined;
                const orders = yield prisma_1.default.order.findMany({
                    skip,
                    take: limit,
                    where: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (orderIdFilter && { orderId: orderIdFilter })), (outletIdFilter && { outletId: outletIdFilter })), (statusFilter && {
                        status: statusFilter,
                    })), (paymentStatusFilter && {
                        paymentStatus: paymentStatusFilter,
                    })), (customerIdFilter && { customerId: customerIdFilter })),
                    include: {
                        outlet: { select: { name: true } },
                        outletAdmin: true,
                        customer: true,
                        workers: {
                            include: {
                                worker: {
                                    include: {
                                        employee: { select: { fullName: true } },
                                    },
                                },
                            },
                        },
                        drivers: {
                            include: {
                                driver: {
                                    include: {
                                        employee: { select: { fullName: true } },
                                    },
                                },
                            },
                        },
                        items: true,
                    },
                    orderBy: {
                        createdAt: sortOrder,
                    },
                });
                const totalOrders = yield prisma_1.default.order.count({
                    where: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (orderIdFilter && { orderId: orderIdFilter })), (outletIdFilter && { outletId: outletIdFilter })), (statusFilter && {
                        status: statusFilter,
                    })), (paymentStatusFilter && {
                        paymentStatus: paymentStatusFilter,
                    })), (customerIdFilter && { customerId: customerIdFilter })),
                });
                const totalPages = Math.ceil(totalOrders / limit);
                return res.status(200).json({
                    data: orders,
                    pagination: {
                        totalItems: totalOrders,
                        totalPages,
                        currentPage: page,
                        pageSize: limit,
                    },
                });
            }
            catch (error) {
                console.error('Error fetching orders:', error);
                res.status(500).json({ error: 'Failed to fetch orders' });
            }
        });
    }
    getNearOutlets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { addressId, customerId } = req.body;
                if (!customerId)
                    throw 'customer location not found';
                const getCustomerLoc = yield prisma_1.default.address.findUnique({
                    where: { addressId: +addressId, customerId: +customerId },
                });
                const customerLoc = {
                    lat: getCustomerLoc === null || getCustomerLoc === void 0 ? void 0 : getCustomerLoc.latitude,
                    lng: getCustomerLoc === null || getCustomerLoc === void 0 ? void 0 : getCustomerLoc.longitude,
                };
                const totalOutlet = yield prisma_1.default.outlet.count();
                const getOutlets = yield prisma_1.default.outlet.findMany();
                const maxRadius = 2000;
                const nearOutlet = getOutlets.map((outlet) => {
                    const outletLoc = { lat: outlet.latitude, lng: outlet.longitude };
                    const distance = (0, geolib_1.getDistance)(customerLoc, outletLoc);
                    const distanceResult = distance > 1000
                        ? `${(distance / 1000).toFixed(2)}km`
                        : `${distance}m`;
                    const nearOutlet = distance <= maxRadius;
                    return Object.assign(Object.assign({}, outlet), { nearOutlet, jarak: `${distanceResult}` });
                });
                const filterOutlet = nearOutlet.filter((outlet) => outlet.nearOutlet == true);
                const totalNearOutlet = nearOutlet.length;
                res.status(200).send({
                    status: 'ok',
                    totalFoundOutlet: totalNearOutlet,
                    data: filterOutlet,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    createPickupOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId, outletId, addressId, pickupDate, pickupTime, status, } = req.body;
                const prismaTransaction = yield prisma_1.default.$transaction((pt) => __awaiter(this, void 0, void 0, function* () {
                    const existCustomer = yield pt.customer.findUnique({
                        where: { customerId: customerId },
                    });
                    if (!existCustomer)
                        throw 'customer not found';
                    const existOutlet = yield pt.outlet.findUnique({
                        where: { outletId: outletId },
                    });
                    if (!existOutlet)
                        throw 'outlet not found';
                    const existAddress = yield pt.address.findUnique({
                        where: { addressId: addressId },
                    });
                    const uniqueOrderId = (0, helper_1.generateUniqueOrderId)(customerId);
                    if (!existAddress)
                        throw 'address user not found';
                    const newOrder = yield pt.order.create({
                        data: {
                            orderInvoice: uniqueOrderId,
                            customerId,
                            outletId,
                            status: 'menungguKonfirmasi',
                            customerAddressId: addressId,
                            pickupDate: new Date(pickupDate),
                            pickupTime,
                        },
                    });
                    return { newOrder };
                }));
                res.status(200).send({
                    status: 'ok',
                    data: prismaTransaction.newOrder,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    getOrderListbyOutlet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId } = req.body;
                const getOrder = yield prisma_1.default.order.findMany({
                    where: { outletId: +outletId },
                    include: {
                        customer: true,
                        drivers: true,
                        outlet: true,
                        outletAdmin: true,
                        workers: true,
                    },
                });
                res.status(200).send({
                    status: 'ok',
                    data: getOrder,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    confirmOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orderId, outletAdminId } = req.body;
                const confirmOrder = yield prisma_1.default.order.update({
                    where: { orderId: +orderId },
                    data: {
                        outletAdminId: +outletAdminId,
                    },
                });
                res.status(200).send({
                    status: 'ok',
                    data: confirmOrder,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    driverOrderList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId } = req.body;
                const listOrder = yield prisma_1.default.order.findMany({
                    where: { outletId: outletId, status: 'menungguPenjemputanDriver' },
                });
                const filter = listOrder.filter((order) => order.outletAdminId !== null);
                res.status(200).send({
                    status: 'ok',
                    data: filter,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    generatePaymentLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orderId, customerId, outletsId, weight, price } = req.body;
                const checkUser = yield prisma_1.default.customer.findUnique({
                    where: { customerId: customerId },
                });
                const checkOrder = yield prisma_1.default.order.findUnique({
                    where: { orderId: +orderId },
                });
                if (!checkOrder)
                    throw 'Order Not Found';
                const uniqueOrder = `${orderId} ${Date.now()}`;
                const parameter = {
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: price * weight,
                    },
                    customer_details: {
                        email: `${checkUser === null || checkUser === void 0 ? void 0 : checkUser.email}`,
                        first_name: checkUser === null || checkUser === void 0 ? void 0 : checkUser.fullName,
                    },
                    expiry: {
                        duration: 15,
                        unit: 'minutes',
                    },
                };
                const url = `https://app.sandbox.midtrans.com`;
                const secret = process.env.MIDTRANS_SECRET_KEY;
                const encodedKey = Buffer.from(secret).toString('base64');
                const paymentLink = yield fetch(`${url}/snap/v1/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${encodedKey}`,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(parameter),
                });
                console.log(paymentLink);
                const response = yield paymentLink.json();
                res.status(200).send({
                    status: 'ok',
                    data: response,
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    getMidtransStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = req.params.orderId;
                const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;
                console.log(url);
                const secret = process.env.MIDTRANS_SECRET_KEY;
                const encodedKey = Buffer.from(secret).toString('base64');
                const midtransRes = yield fetch(url, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${encodedKey}`,
                        Accept: 'application/json',
                    }
                });
                const resultMidtrans = yield midtransRes.json();
                console.log(resultMidtrans);
                res.status(200).send({
                    status: 'ok',
                    data: resultMidtrans,
                    message: "Pembayaran Sukses"
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err,
                });
            }
        });
    }
    updatePaymentOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id, transaction_status, status_code } = req.body;
                const url = `https://app.sandbox.midtrans.com`;
                console.log(order_id, transaction_status, status_code);
                if (!order_id || !transaction_status || !status_code)
                    throw 'invalid query';
                const checkOrder = yield prisma_1.default.order.findUnique({
                    where: { orderId: +order_id, paymentStatus: 'unpaid' },
                });
                if (checkOrder &&
                    transaction_status === 'settlement' &&
                    status_code === '200') {
                    if (checkOrder.status === "menungguPembayaran") {
                        yield prisma_1.default.order.update({
                            where: { orderId: +order_id },
                            data: {
                                status: 'siapDiantar',
                                paymentStatus: 'paid',
                                deliverDate: new Date()
                            },
                        });
                    }
                    else {
                        yield prisma_1.default.order.update({
                            where: { orderId: +order_id },
                            data: {
                                paymentStatus: 'paid',
                                deliverDate: new Date()
                            },
                        });
                    }
                }
                res.status(200).send({
                    status: 'ok',
                    msg: 'payment status updated to paid',
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'ok',
                    err: err,
                });
            }
        });
    }
    getOrderListCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId } = req.params;
                const { q } = req.query;
                let filter = {};
                if (q) {
                    const orderId = Number(q);
                    if (!isNaN(orderId)) {
                        filter.orderId = { equals: orderId };
                    }
                    else {
                        throw new Error("Invalid query parameter: `q` must be a number.");
                    }
                }
                console.log(filter);
                const sortBy = req.query.sortBy || 'createdAt';
                const sortOrder = req.query.sortOrder || 'desc';
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const skip = (page - 1) * limit;
                const listOrder = yield prisma_1.default.order.findMany({
                    where: Object.assign({ customerId: +customerId }, filter),
                    skip: skip,
                    take: limit,
                    orderBy: {
                        [sortBy]: sortOrder,
                    },
                    include: {
                        drivers: true,
                        items: true,
                        outlet: true,
                        outletAdmin: true,
                    },
                });
                const totalOrder = yield prisma_1.default.order.count({
                    where: Object.assign({ customerId: +customerId }, filter),
                });
                res.status(200).send({
                    status: 'ok',
                    data: listOrder,
                    total: totalOrder,
                    page: page,
                    totalPages: Math.ceil(totalOrder / limit),
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err,
                });
            }
        });
    }
}
exports.OrderController = OrderController;
