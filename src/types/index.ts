export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  features: string[];
  inStock: boolean;
  brand: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  interactions: UserInteraction[];
}

export interface UserPreferences {
  categories: string[];
  priceRange: [number, number];
  brands: string[];
}

export interface UserInteraction {
  productId: string;
  type: 'view' | 'like' | 'cart' | 'purchase';
  timestamp: number;
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface RecommendationScore {
  productId: string;
  score: number;
  reason: string;
}