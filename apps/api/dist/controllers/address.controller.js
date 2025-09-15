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
exports.AddressController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AddressController {
    createAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { latitude, longitude, province, city, subdistrict, detailAddress, customerId } = req.body;
                const newAddress = yield prisma_1.default.address.create({
                    data: {
                        customerId: customerId,
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        provinsi: province,
                        kota: city,
                        kecamatan: subdistrict,
                        detailAddress
                    }
                });
                res.status(200).send({
                    status: 'ok',
                    data: newAddress
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err
                });
            }
        });
    }
    mainAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId, addressId } = req.body;
                const checkUserAddress = yield prisma_1.default.address.findMany({
                    where: {
                        customerId: +customerId,
                    }
                });
                for (let address of checkUserAddress) {
                    if (address.isPrimary) {
                        yield prisma_1.default.address.update({
                            where: { addressId: +address.addressId, isPrimary: true },
                            data: {
                                isPrimary: false,
                            },
                        });
                    }
                }
                yield prisma_1.default.address.update({
                    where: { addressId: +addressId },
                    data: {
                        isPrimary: true
                    }
                });
                res.status(200).send({
                    status: 'ok',
                    message: `address ${addressId} updated to primary`
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
    deleteAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { addressId } = req.params;
                const deleteAddress = yield prisma_1.default.address.delete({
                    where: { addressId: +addressId }
                });
                res.status(200).send({
                    status: 'ok',
                    data: deleteAddress,
                    message: `Berhasil Menghapus Alamat`
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
    getUserAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { customerId } = req.params;
                const checkUser = yield prisma_1.default.customer.findUnique({
                    where: { customerId: +customerId }
                });
                if (!checkUser)
                    throw 'user not found';
                const userAddress = yield prisma_1.default.address.findMany({
                    where: { customerId: +customerId }
                });
                res.status(200).send({
                    status: 'ok',
                    data: userAddress
                });
            }
            catch (err) {
                res.status(400).send({
                    status: 'failed',
                    error: err
                });
            }
        });
    }
}
exports.AddressController = AddressController;
