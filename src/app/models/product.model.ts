export interface ProductListItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  isActive: boolean;
  primaryImageUrl: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  description: string;
  size?: string;
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
  brand: string;
  category: string;
  brandId: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  stock: number;
  isActive: boolean;
  images: ProductImage[];
  reviews: Review[];
}

export interface ProductUpsertRequest {
  name: string;
  sku: string;
  description: string;
  size?: string;
  specifications?: Record<string, string>;
  variants?: ProductVariantUpsert[];
  price: number;
  oldPrice?: number | null;
  stock: number;
  categoryId: string;
  brandId: string;
  isActive?: boolean;
}

export interface ProductVariant {
  size: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  isActive: boolean;
}

export interface ProductVariantUpsert {
  size: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  isActive: boolean;
}
