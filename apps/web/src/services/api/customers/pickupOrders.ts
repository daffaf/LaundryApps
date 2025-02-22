import { getToken } from "@/lib/server"
import { IAddress } from "@/type/address"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'

export type IOrderPickup = {
  addressId: number
  customerId: number
  outletId: number
  pickupDate: Date
  pickupTime: string
}
export const getNearOutlet = async (data: IAddress) => {
  const res = await fetch(`${BASEURL}/api/orders/pickup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const result = await res.json()
  return { result, ok: res.ok, nearOutlet: result.data }
}
export const createPickupOrder = async (data: IOrderPickup) => {
  const token = await getToken()
  const res = await fetch(`${BASEURL}/api/orders/pickup/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  console.log(data)
  const result = await res.json()
  console.log(result)
  return { result, ok: res.ok }
}