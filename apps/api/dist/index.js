"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
// Buat instance sekali
const app = new app_1.default();
// 🚀 Export Express app langsung (Vercel akan bungkus jadi handler)
exports.default = app.getApp();
