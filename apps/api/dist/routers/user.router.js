"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const auth_controller_1 = require("../controllers/auth.controller");
const multer_1 = require("../middleware/multer");
const token_1 = require("../middleware/token");
// import { FirebaseAuth } from "../services/firebase";
const express_1 = require("express");
class UserRouter {
    // private fireBaseAuth : FirebaseAuth
    constructor() {
        this.authController = new auth_controller_1.AuthController();
        // this.fireBaseAuth = new FirebaseAuth()
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register', this.authController.registerUser);
        this.router.post('/login-customer', this.authController.loginCustomer);
        this.router.post('/login-worker', this.authController.loginWorker);
        this.router.get('/:customerId', this.authController.getUserById);
        this.router.post('/verify/:token', this.authController.verificationUser);
        this.router.post('/reset', this.authController.sendResetPassword);
        this.router.post('/reset/:token', this.authController.resetPassword);
        this.router.post('/change-email', token_1.verifyToken, this.authController.changeEmail);
        this.router.get('/verify-email/:token', this.authController.verifyEmail);
        this.router.post('/send-emailVerification', this.authController.sendEmailVerification);
        // this.router.post('/auth/google', this.fireBaseAuth.googleAuthHandler );
        this.router.patch('/edit', (0, multer_1.uploader)('memoryStorage', 'avatar-', '/avatar').single('avatar'), token_1.verifyToken, this.authController.editProfile);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
