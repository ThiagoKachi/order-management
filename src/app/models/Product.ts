export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  image?: string;
  accountId: string
}
