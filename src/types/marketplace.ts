// Graz Marketplace TypeScript Interfaces

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  subcategory?: string;
  price: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
  images: string[];
  status: 'active' | 'inactive' | 'sold' | 'draft';
  stock: number;
  sku?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: number;
  featured: boolean;
  condition?: 'new' | 'used' | 'refurbished';
  location?: string;
  specifications?: Record<string, any>;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  attributes: Record<string, string>;
}

export type MarketplaceCategory = 
  | 'electronics'
  | 'fashion'
  | 'home_garden'
  | 'automotive'
  | 'books_media'
  | 'sports_outdoors'
  | 'health_beauty'
  | 'toys_games'
  | 'food_beverages'
  | 'services'
  | 'real_estate'
  | 'education'
  | 'travel'
  | 'business_equipment';

export interface StockItem {
  id: string;
  listing_id: string;
  listing_title: string;
  sku: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  last_restocked: string;
  cost_price: number;
  selling_price: number;
  supplier?: string;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: number;
  sender_name: string;
  sender_type: 'customer' | 'agent' | 'system';
  message: string;
  message_type: 'text' | 'image' | 'file' | 'product_link';
  product_id?: string;
  timestamp: string;
  read: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

export interface ChatSession {
  id: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  agent_id?: number;
  agent_name?: string;
  product_id?: string;
  product_title?: string;
  status: 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  last_message_at: string;
  message_count: number;
  unread_count: number;
}

export interface MarketplaceStats {
  total_listings: number;
  active_listings: number;
  total_sales: number;
  monthly_sales: number;
  total_revenue: number;
  monthly_revenue: number;
  average_rating: number;
  total_reviews: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_orders: number;
  active_chats: number;
}

export interface MarketplaceFilter {
  category?: MarketplaceCategory;
  status?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  featured?: boolean;
  search?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}

export interface MarketplaceSort {
  field: 'title' | 'price' | 'created_at' | 'updated_at' | 'stock' | 'sales';
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'update_stock' | 'update_price';
  listing_ids: string[];
  data?: Record<string, any>;
}

export interface MarketplaceAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  top_categories: Array<{
    category: MarketplaceCategory;
    count: number;
    revenue: number;
  }>;
  top_products: Array<{
    product_id: string;
    title: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
}
