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
exports.geocodeAddress = void 0;
const axios_1 = __importDefault(require("axios"));
const geocodeAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield axios_1.default.get(`https://api.opencagedata.com/geocode/v1/json`, {
            params: {
                key: process.env.OPENCAGE_API_KEY,
                q: address,
                pretty: 1,
                no_annotation: 1
            }
        });
        if (res.data.results[0].length > 0) {
            // const { lat, lang } = res.data.results[0].geometry
            // return { latitude: lat, longitude: lang }
            return res;
        }
        else {
            throw 'no result found';
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.geocodeAddress = geocodeAddress;
