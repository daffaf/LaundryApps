export type ICustomerLogin = {
  email: string
  password: string
}
export type ICustomerReg = {
  email: string
  fullName: string
  role: string
}
export type ICustomerVerify = {
  token: string | any
  password: string
  confirmPassword: string
}

export type ICustomerAddress = {
  addressId: number
  longitude: number
  latitude: number
  province: string
  city: string
  subdistrict: string
  detailAddress: string
  customerId : number
}
export type ICustomersResetPass = {
  email: string
}
export type ICustomerNewPass = {
  newPassword: string
  confirmNewPassword: string
}
export type IUserEdit = {
  customerId: number,
  avatar? : File | null | string,
  fullName: string,
}
export type ICustomerOrderData = {
  orderInvoice: string;
  outlet: {
    name: string;
  };
  items: []
  status: string;
  paymentStatus: string;
  weight: number;
  pricePerKg: number;
  total: number;
  createdAt : Date
};
export type orderItems = {
  item: string
  quantity: string
}
export type ICustomerPayment = {
  // orderId: number
  orderInvoice : string
  customerId: number
  weight: number
  price : number
}
export type ISendEmailVerification = {
  email: string
}
export type ICustomerEditEmail = {
  email: string
  newEmail: string
}