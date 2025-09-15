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
exports.ItemsController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ItemsController {
    getItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortBy = req.query.sortBy || 'itemId';
            const order = req.query.order === 'desc' ? 'desc' : 'asc';
            const orderId = req.query.orderId
                ? parseInt(req.query.orderId)
                : undefined;
            const itemName = req.query.item || undefined;
            const filter = Object.assign(Object.assign({}, (orderId && { orderId })), (itemName && { item: { contains: itemName.toLowerCase() } }));
            try {
                const itemsData = yield prisma_1.default.items.findMany({
                    where: filter,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { [sortBy]: order },
                });
                const totalItems = yield prisma_1.default.items.count({ where: filter });
                const totalPages = Math.ceil(totalItems / limit);
                res.status(200).json({
                    data: itemsData,
                    pagination: {
                        page,
                        limit,
                        totalPages,
                        totalItems,
                    },
                });
            }
            catch (error) {
                console.error('Error fetching items:', error);
                res.status(500).json({ error: 'Error fetching items' });
            }
        });
    }
    getItemById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const item = yield prisma_1.default.items.findUnique({
                where: { itemId: Number(id) },
            });
            if (!item) {
                return res.send(404);
            }
            return res.status(200).send(item);
        });
    }
    createitem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId, item, quantity } = req.body;
            try {
                const newItemData = yield prisma_1.default.items.create({
                    data: { orderId, item, quantity },
                });
                return res
                    .status(201)
                    .send({ message: 'New item has been added', newItemData });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create item' });
            }
        });
    }
    updateItemById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { item, quantity } = req.body;
            try {
                const existingItem = yield prisma_1.default.items.findUnique({
                    where: { itemId: Number(id) },
                });
                if (!existingItem) {
                    res.status(404).json({ message: 'Item not found' });
                    return;
                }
                const updatedItem = yield prisma_1.default.items.update({
                    where: { itemId: Number(id) },
                    data: {
                        item: item !== undefined ? item : existingItem.item,
                        quantity: quantity !== undefined ? quantity : existingItem.quantity,
                    },
                });
                res
                    .status(200)
                    .json({ message: 'Item updated successfully', updatedItem });
            }
            catch (_a) {
                res.status(500).json({ message: 'Error updating item' });
            }
        });
    }
    deleteItemById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const deletedItem = yield prisma_1.default.items.delete({
                    where: { itemId: Number(id) },
                });
                return res
                    .status(200)
                    .send({ message: 'Item deleted successfully', deletedItem });
            }
            catch (error) {
                return res.status(500).send({
                    error: 'Item not found or could not be deleted',
                });
            }
        });
    }
}
exports.ItemsController = ItemsController;
