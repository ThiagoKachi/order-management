export interface Order {
  products: {
    productId: string
    quantity: number
  }[]
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED'
}