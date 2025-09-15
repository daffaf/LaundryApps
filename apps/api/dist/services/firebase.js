"use strict";
// src/services/firebaseauth.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuth = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const admin = __importStar(require("firebase-admin"));
const jsonwebtoken_1 = require("jsonwebtoken");
admin.initializeApp({
    // credential: admin.credential.applicationDefault()
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
    })
});
class FirebaseAuth {
    googleAuthHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            let data;
            console.log(token);
            if (!token)
                throw new Error('Token is Required');
            try {
                const decodedToken = yield admin.auth().verifyIdToken(token);
                console.log('Decoded token:', decodedToken);
                const checkUser = yield prisma_1.default.customer.findUnique({
                    where: { email: decodedToken.email }
                });
                if (!checkUser) {
                    data = yield prisma_1.default.customer.create({
                        data: {
                            email: decodedToken.email,
                            fullName: decodedToken.email,
                            avatar: decodedToken.picture,
                            role: 'customer'
                        }
                    });
                }
                else {
                    data = checkUser;
                }
                const payload = { customerId: data.customerId, role: data.role };
                const tokenData = (0, jsonwebtoken_1.sign)(payload, process.env.SECRET_JWT, { expiresIn: '1d' });
                console.log(data);
                res.status(200).send({
                    status: 'ok',
                    tokenData: tokenData,
                    data: data
                });
            }
            catch (err) {
                console.error('Error verifying token:', err);
                res.status(400).send({
                    status: 'failed',
                    err: err
                });
            }
        });
    }
}
exports.FirebaseAuth = FirebaseAuth;
