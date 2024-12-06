import { AddressController } from "@/controllers/address.controller";
import { verifyToken } from "@/middleware/token";
import { Router } from "express";

export class AddressRouter {
  private router: Router
  private addressController: AddressController

  constructor() {
    this.addressController = new AddressController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', verifyToken, this.addressController.createAddress);
    this.router.get('/:customerId', this.addressController.getUserAddress);
    this.router.post('/primary', verifyToken, this.addressController.mainAddress);
    this.router.delete('/:addressId', this.addressController.deleteAddress)
  }

  getRouter(): Router {
    return this.router
  }
}