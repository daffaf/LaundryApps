export const generateUniqueOrderId = (customerId: number): string => {
  const timestamp = Number(Date.now().toString().slice(-8)); 
  const orderId = `${timestamp}${customerId}`; 
  return `order-${orderId}`;
}
