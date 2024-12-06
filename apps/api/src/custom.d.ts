type Customers = {
 id :number
  role: string
}
declare namespace Express {
  export interface Request {
    customers?: Customers
  }
}