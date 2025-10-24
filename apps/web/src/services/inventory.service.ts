import { enhancedApiClient } from '../lib/api-client';

/**
 * Inventory Management API Service
 * Handles all inventory operations including items, stock management, and low stock alerts
 */

// Types
export interface CreateInventoryItemDto {
  name: string;
  itemCode?: string;
  category?: string;
  description?: string;
  quantity: number;
  minQuantity?: number;
  unitPrice?: number;
  unit?: string;
  supplier?: string;
  location?: string;
  expiryDate?: string;
}

export interface UpdateInventoryItemDto {
  name?: string;
  itemCode?: string;
  category?: string;
  description?: string;
  quantity?: number;
  minQuantity?: number;
  unitPrice?: number;
  unit?: string;
  supplier?: string;
  location?: string;
  expiryDate?: string;
}

export interface InventoryFilters {
  category?: string;
  supplier?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InventoryItemResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    itemCode?: string;
    category?: string;
    description?: string;
    quantity: number;
    minQuantity?: number;
    unitPrice?: number;
    unit?: string;
    supplier?: string;
    location?: string;
    expiryDate?: string;
    isActive: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface InventoryItemsListResponse {
  success: boolean;
  data: {
    items: InventoryItemResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface InventoryStatsResponse {
  success: boolean;
  data: {
    total: number;
    lowStock: number;
    totalQuantity: number;
  };
}

const inventoryService = {
  // ==================== INVENTORY ITEMS ====================

  /**
   * Create new inventory item
   */
  createItem: async (data: CreateInventoryItemDto): Promise<InventoryItemResponse> => {
    return enhancedApiClient.post('/inventory', data);
  },

  /**
   * Get all inventory items with filters
   */
  getItems: async (filters?: InventoryFilters): Promise<InventoryItemsListResponse> => {
    return enhancedApiClient.get('/inventory', filters);
  },

  /**
   * Get low stock items
   */
  getLowStock: async (): Promise<{ success: boolean; data: InventoryItemResponse['data'][] }> => {
    return enhancedApiClient.get('/inventory/low-stock');
  },

  /**
   * Get inventory item by ID
   */
  getItemById: async (id: string): Promise<InventoryItemResponse> => {
    return enhancedApiClient.get(`/inventory/${id}`);
  },

  /**
   * Update inventory item
   */
  updateItem: async (id: string, data: UpdateInventoryItemDto): Promise<InventoryItemResponse> => {
    return enhancedApiClient.patch(`/inventory/${id}`, data);
  },

  /**
   * Adjust stock quantity
   */
  adjustStock: async (id: string, quantity: number): Promise<InventoryItemResponse> => {
    return enhancedApiClient.patch(`/inventory/${id}/adjust-stock`, { quantity });
  },

  /**
   * Delete inventory item (soft delete)
   */
  deleteItem: async (id: string): Promise<InventoryItemResponse> => {
    return enhancedApiClient.delete(`/inventory/${id}`);
  },

  // ==================== STATISTICS ====================

  /**
   * Get inventory statistics
   */
  getStats: async (): Promise<InventoryStatsResponse> => {
    return enhancedApiClient.get('/inventory/stats');
  },
};

export default inventoryService;
