import { NextFunction, Request, Response } from "express";
import { verify as jwtVerify } from "jsonwebtoken";
type Customers = {
  id :number
   role: string
 }
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    console.log('token',token)
    if (!token) throw new Error("Invalid token")

    const verifiedToken = jwtVerify(token, process.env.SECRET_JWT!) as Customers
    req.customers = verifiedToken 

    next()
  } catch (err) {
    return res.status(400).send({
      status: 'failed token',
      err: err
    })
  }
}
// export const checkIsWorker = async(req)
