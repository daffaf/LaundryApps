"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRouter = void 0;
const location_controller_1 = require("../controllers/location.controller");
const copylocation_1 = require("../services/copylocation");
const express_1 = require("express");
class LocationRouter {
    constructor() {
        this.locationController = new location_controller_1.LocationController();
        this.copyLocation = new copylocation_1.CopyLocation();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', this.locationController.getLngLat);
        this.router.get('/copyDetail', this.copyLocation.copyDetailLocation);
        this.router.get('/provinces', this.locationController.getProvinsi);
        this.router.get('/city', this.locationController.getKabupaten);
        this.router.get('/subdistricts', this.locationController.getKecamatan);
        this.router.get('/', this.locationController.getLocation);
    }
    getRouter() {
        return this.router;
    }
}
exports.LocationRouter = LocationRouter;
