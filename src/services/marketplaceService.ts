import  api  from './api';
import type {
  MarketplaceListing,
  StockItem,
  ChatSession,
  ChatMessage,
  MarketplaceFilter,
  MarketplaceSort,
  BulkAction
} from '../types/marketplace';

// Marketplace Listings API
export const marketplaceApi = {
  // Listings
  getListings: async (filter?: MarketplaceFilter, sort?: MarketplaceSort, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {} as Record<string, string>)),
      ...(sort && { sort_by: sort.field, sort_order: sort.direction })
    });

    const response = await api.get(`/marketplace/listings?${params}`);
    return response.data;
  },

  getListing: async (id: string) => {
    const response = await api.get(`/marketplace/listings/${id}`);
    return response.data;
  },

  createListing: async (listing: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/marketplace/listings', listing);
    return response.data;
  },

  updateListing: async (id: string, listing: Partial<MarketplaceListing>) => {
    const response = await api.put(`/marketplace/listings/${id}`, listing);
    return response.data;
  },

  deleteListing: async (id: string) => {
    const response = await api.delete(`/marketplace/listings/${id}`);
    return response.data;
  },

  bulkAction: async (action: BulkAction) => {
    const response = await api.post('/marketplace/listings/bulk-action', action);
    return response.data;
  },

  // Stock Management
  getStock: async (filter?: { status?: string; low_stock?: boolean }) => {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.low_stock) params.append('low_stock', 'true');

    const response = await api.get(`/marketplace/stock?${params}`);
    return response.data;
  },

  updateStock: async (id: string, stock: Partial<StockItem>) => {
    const response = await api.put(`/marketplace/stock/${id}`, stock);
    return response.data;
  },

  bulkUpdateStock: async (updates: Array<{ id: string; stock: Partial<StockItem> }>) => {
    const response = await api.post('/marketplace/stock/bulk-update', { updates });
    return response.data;
  },

  // Chat Management
  getChatSessions: async (status?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    const response = await api.get(`/marketplace/chat/sessions?${params}`);
    return response.data;
  },

  getChatMessages: async (chatId: string, page = 1, limit = 50) => {
    const response = await api.get(`/marketplace/chat/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) => {
    const response = await api.post(`/marketplace/chat/${chatId}/messages`, message);
    return response.data;
  },

  updateChatStatus: async (chatId: string, status: string) => {
    const response = await api.put(`/marketplace/chat/${chatId}/status`, { status });
    return response.data;
  },

  assignChat: async (chatId: string, agentId: number) => {
    const response = await api.post(`/marketplace/chat/${chatId}/assign`, { agent_id: agentId });
    return response.data;
  },

  // Analytics & Stats
  getStats: async () => {
    const response = await api.get('/marketplace/stats');
    return response.data;
  },

  getAnalytics: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
    const response = await api.get(`/marketplace/analytics?period=${period}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/marketplace/categories');
    return response.data;
  },

  // File Upload
  uploadImage: async (file: File, listingId?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (listingId) formData.append('listing_id', listingId);

    const response = await api.post('/marketplace/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteImage: async (imageId: string) => {
    const response = await api.delete(`/marketplace/images/${imageId}`);
    return response.data;
  }
};

// Mock data for development
export const mockMarketplaceData = {
  listings: [
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      category: 'electronics' as const,
      subcategory: 'smartphones',
      price: 1200000,
      currency: 'NGN' as const,
      images: ['/images/iphone15.jpg'],
      status: 'active' as const,
      stock: 5,
      sku: 'IPH15PM256',
      tags: ['apple', 'smartphone', '5g'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 1,
      featured: true,
      condition: 'new' as const,
      location: 'Lagos, Nigeria',
      specifications: {
        storage: '256GB',
        color: 'Natural Titanium',
        screen_size: '6.7 inches'
      }
    },
    {
      id: '2',
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android smartphone with S Pen and 200MP camera',
      category: 'electronics' as const,
      subcategory: 'smartphones',
      price: 1100000,
      currency: 'NGN' as const,
      images: ['/images/samsung-s24.jpg'],
      status: 'active' as const,
      stock: 3,
      sku: 'SGS24U512',
      tags: ['samsung', 'android', 's-pen'],
      created_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-14T15:30:00Z',
      created_by: 1,
      featured: false,
      condition: 'new' as const,
      location: 'Abuja, Nigeria'
    }
  ] as MarketplaceListing[],

  stock: [
    {
      id: '1',
      listing_id: '1',
      listing_title: 'iPhone 15 Pro Max 256GB',
      sku: 'IPH15PM256',
      current_stock: 5,
      reserved_stock: 1,
      available_stock: 4,
      min_stock_level: 2,
      max_stock_level: 20,
      last_restocked: '2024-01-10T09:00:00Z',
      cost_price: 1000000,
      selling_price: 1200000,
      supplier: 'Apple Nigeria',
      location: 'Lagos Warehouse',
      status: 'in_stock' as const
    },
    {
      id: '2',
      listing_id: '2',
      listing_title: 'Samsung Galaxy S24 Ultra',
      sku: 'SGS24U512',
      current_stock: 3,
      reserved_stock: 0,
      available_stock: 3,
      min_stock_level: 1,
      max_stock_level: 15,
      last_restocked: '2024-01-12T14:00:00Z',
      cost_price: 950000,
      selling_price: 1100000,
      supplier: 'Samsung Nigeria',
      location: 'Abuja Warehouse',
      status: 'in_stock' as const
    }
  ] as StockItem[],

  chatSessions: [
    {
      id: '1',
      customer_id: 101,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      agent_id: 1,
      agent_name: 'Agent Smith',
      product_id: '1',
      product_title: 'iPhone 15 Pro Max 256GB',
      status: 'active' as const,
      priority: 'medium' as const,
      created_at: '2024-01-15T08:00:00Z',
      last_message_at: '2024-01-15T16:30:00Z',
      message_count: 12,
      unread_count: 2
    }
  ] as ChatSession[]
};
