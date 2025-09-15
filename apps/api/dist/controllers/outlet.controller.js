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
exports.OutletController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class OutletController {
    getOutlet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const sortBy = req.query.sortBy === 'desc' ? 'desc' : 'asc';
                const nameFilter = req.query.name ? String(req.query.name) : undefined;
                const kotaFilter = req.query.kota ? String(req.query.kota) : undefined;
                const outletData = yield prisma_1.default.outlet.findMany({
                    skip,
                    take: limit,
                    orderBy: {
                        outletId: sortBy,
                    },
                    where: Object.assign(Object.assign({}, (nameFilter && {
                        name: { contains: nameFilter },
                    })), (kotaFilter && {
                        kota: { contains: kotaFilter.toLowerCase() },
                    })),
                });
                const totalOutlets = yield prisma_1.default.outlet.count({
                    where: Object.assign(Object.assign({}, (nameFilter && {
                        name: { contains: nameFilter.toLowerCase() },
                    })), (kotaFilter && {
                        kota: { contains: kotaFilter.toLowerCase() },
                    })),
                });
                const totalPages = Math.ceil(totalOutlets / limit);
                return res.status(200).json({
                    data: outletData,
                    pagination: {
                        totalItems: totalOutlets,
                        totalPages,
                        currentPage: page,
                        pageSize: limit,
                    },
                });
            }
            catch (error) {
                console.error('Error fetching outlets:', error);
                return res.status(500).json({ error: 'Failed to fetch outlets' });
            }
        });
    }
    getOutletById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const outlet = yield prisma_1.default.outlet.findUnique({
                where: { outletId: Number(id) },
            });
            if (!outlet) {
                return res.send(404);
            }
            return res.status(200).send(outlet);
        });
    }
    createOutlet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, provinsi, kota, kecamatan, longitude, latitude } = req.body;
                const newOutletData = yield prisma_1.default.outlet.create({
                    data: {
                        name,
                        provinsi,
                        kota,
                        kecamatan,
                        longitude: parseFloat(longitude),
                        latitude: parseFloat(latitude),
                    },
                });
                res.status(200).send({
                    status: 'ok',
                    data: newOutletData,
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
    updateOutletyId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, provinsi, kota, kecamatan, longitude, latitude } = req.body;
            try {
                const existingOutlet = yield prisma_1.default.outlet.findUnique({
                    where: { outletId: Number(id) },
                });
                if (!existingOutlet) {
                    res.status(404).json({ message: 'Outlet not found' });
                    return;
                }
                const updatedOutlet = yield prisma_1.default.outlet.update({
                    where: { outletId: Number(id) },
                    data: {
                        name: name !== undefined ? name : existingOutlet.name,
                        provinsi: provinsi !== undefined ? provinsi : existingOutlet.provinsi,
                        kota: kota !== undefined ? kota : existingOutlet.kota,
                        kecamatan: kecamatan !== undefined ? kecamatan : existingOutlet.kecamatan,
                        longitude: longitude !== undefined
                            ? parseFloat(longitude)
                            : existingOutlet.longitude,
                        latitude: latitude !== undefined
                            ? parseFloat(latitude)
                            : existingOutlet.latitude,
                    },
                });
                res
                    .status(200)
                    .json({ message: 'Outlet updated successfully', updatedOutlet });
            }
            catch (_a) {
                res.status(500).json({ message: 'Error updating Outlet' });
            }
        });
    }
    deleteOutletById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const deletedOutlet = yield prisma_1.default.outlet.delete({
                    where: { outletId: Number(id) },
                });
                return res
                    .status(200)
                    .send({ message: 'Outlet delete successfully', deletedOutlet });
            }
            catch (error) {
                return res.status(500).send({
                    error: 'Item not found or could not be deleted',
                });
            }
        });
    }
}
exports.OutletController = OutletController;
