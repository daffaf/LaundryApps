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
exports.LocationController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class LocationController {
    getLngLat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address } = req.body;
                console.log(address);
                const key = process.env.OPENCAGE_API_KEY;
                const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${`3fc01d48104243d79861a4937bc0e954`}`;
                console.log(openCageUrl);
                const location = yield fetch(`${openCageUrl}`, {
                    method: 'GET',
                });
                const result = yield location.json();
                const lng = result.results[0].geometry.lng;
                const lat = result.results[0].geometry.lat;
                res.status(200).send({
                    status: 'ok',
                    lng: lng,
                    lat: lat,
                });
            }
            catch (error) {
                res.status(400).send({
                    status: 'failed',
                    error,
                });
            }
        });
    }
    getProvinsi(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getData = yield prisma_1.default.listAddress.findMany({
                    select: { province: true },
                });
                const filterSameData = Array.from(new Set(getData.map((province) => province.province))).map((filtered) => ({ province: filtered }));
                res.status(200).send({
                    status: 'ok',
                    data: filterSameData,
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
    getKabupaten(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { province } = req.query;
                const getData = yield prisma_1.default.listAddress.findMany({
                    select: { city: true },
                    where: { province: province },
                });
                const filterSameData = Array.from(new Set(getData.map((city) => city.city))).map((filtered) => ({ city: filtered }));
                res.status(200).send({
                    status: 'ok',
                    data: filterSameData,
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
    getKecamatan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { city } = req.query;
                const cityPrefix = `Kota ${city}`;
                const getData = yield prisma_1.default.listAddress.findMany({
                    select: { subdistrict: true, id: true, cityId: true, provinceId: true },
                    where: { city: city },
                });
                res.status(200).send({
                    status: 'ok',
                    data: getData,
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
    getLocation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { province, city, subdistrict } = req.query;
                const getData = yield prisma_1.default.listAddress.findMany({
                    where: {
                        province: province,
                        city: city,
                        subdistrict: subdistrict,
                    },
                });
                res.status(200).send({
                    status: 'ok',
                    data: getData,
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
}
exports.LocationController = LocationController;
