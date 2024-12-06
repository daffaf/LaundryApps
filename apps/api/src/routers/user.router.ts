import { AuthController } from "@/controllers/auth.controller";
import { uploader } from "@/middleware/multer";
import { verifyToken } from "@/middleware/token";
import { FirebaseAuth } from "@/services/firebase";
import { Router } from "express";

export class UserRouter {
  private router: Router
  private authController: AuthController
  private fireBaseAuth : FirebaseAuth

  constructor() {
    this.authController = new AuthController();
    this.fireBaseAuth = new FirebaseAuth()
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes(): void {
    this.router.post('/register', this.authController.registerUser);
    this.router.post('/login-customer', this.authController.loginCustomer);
    this.router.post('/login-worker', this.authController.loginWorker)
    this.router.get('/:customerId', this.authController.getUserById)
    this.router.post('/verify/:token', this.authController.verificationUser);
    this.router.post('/reset', this.authController.sendResetPassword);
    this.router.post('/reset/:token', this.authController.resetPassword)
    this.router.post('/change-email', verifyToken, this.authController.changeEmail)
    this.router.get('/verify-email/:token', this.authController.verifyEmail)
    this.router.post('/send-emailVerification',this.authController.sendEmailVerification)
    this.router.post('/auth/google', this.fireBaseAuth.googleAuthHandler );
    this.router.patch('/edit',
      uploader('memoryStorage', 'avatar-', '/avatar').single('avatar'),
      verifyToken
      ,this.authController.editProfile)
    
  }

  getRouter(): Router {
    return this.router
  }
}