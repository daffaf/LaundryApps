"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueOrderId = void 0;
const generateUniqueOrderId = (customerId) => {
    const timestamp = Number(Date.now().toString().slice(-8));
    const orderId = `${timestamp}${customerId}`;
    return `order-${orderId}`;
};
exports.generateUniqueOrderId = generateUniqueOrderId;
