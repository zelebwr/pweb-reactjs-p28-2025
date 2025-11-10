import { apiClient } from '../../../lib/apiClient';
import type { 
  CreateTransactionInput, 
  CreateTransactionResponse,
  ApiTransactionListResponse,
  ApiTransactionDetail,
  ApiTransactionQuery
} from '@react-express-library/shared';

/**
 * Create a new transaction (checkout)
 */
export const createTransaction = async (data: CreateTransactionInput): Promise<CreateTransactionResponse> => {
  const response = await apiClient.post('/transactions', data);
  return response.data.data;
};

/**
 * Get all transactions with pagination and filters
 */
export const getAllTransactions = async (query: ApiTransactionQuery = {}): Promise<ApiTransactionListResponse> => {
  const params = new URLSearchParams();
  
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.status) params.append('status', query.status);
  if (query.orderById) params.append('orderById', query.orderById);
  if (query.orderByAmount) params.append('orderByAmount', query.orderByAmount);
  if (query.orderByPrice) params.append('orderByPrice', query.orderByPrice);
  if (query.orderByDate) params.append('orderByDate', query.orderByDate);

  const response = await apiClient.get(`/transactions?${params.toString()}`);
  return {
    transactions: response.data.data,
    total: response.data.meta.total,
  };
};

/**
 * Get transaction detail by ID
 */
export const getTransactionById = async (id: string): Promise<ApiTransactionDetail> => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data.data;
};
