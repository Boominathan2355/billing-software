/**
 * Central API service layer.
 *
 * Pattern:
 *   - Each resource (products, customers, bills, …) has its own object
 *   - Functions are typed: inputs and return shapes are explicit
 *   - Pages only import from here — never call `api.get(...)` directly
 *   - All errors bubble up as `Error.message` (handled by the axios interceptor)
 *
 * Usage example:
 *   import { productsApi } from '@/api/services';
 *   const products = await productsApi.list();
 */

import api from './client';
import type { Customer, Product, Transaction, DashboardMetrics } from '../types';

// ─── Reusable payload shapes ────────────────────────────────────────────────

export interface BillPayload {
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  paymentType: 'CASH' | 'UDHAAR' | 'ONLINE';
  items: { productId: string; qty: number; price: number }[];
  gstRate?: number;
  discount?: { type: 'FLAT' | 'PERCENTAGE'; value: number };
  status?: 'DRAFT' | 'COMPLETED';
  draftId?: string | null;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: { username: string; role: string } }>(
      '/auth/login',
      { username, password }
    ).then(r => r.data),
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () =>
    api.get<DashboardMetrics>('/dashboard').then(r => r.data),
};

// ─── Products (Inventory) ───────────────────────────────────────────────────

export type ProductPayload = {
  name: string;
  unitName: string;
  freeStock?: number;
  price?: number;
  purchasePrice?: number;
};

export const productsApi = {
  list:    ()                          => api.get<Product[]>('/products').then(r => r.data),
  create:  (p: ProductPayload)         => api.post<Product>('/products', p).then(r => r.data),
  update:  (id: string, p: Partial<ProductPayload>) =>
    api.put<Product>(`/products/${id}`, p).then(r => r.data),
  delete:  (id: string)                => api.delete(`/products/${id}`).then(r => r.data),
  stockIn: (id: string, qty: number, purchasePrice?: number) =>
    api.patch<Product>(`/products/${id}/stock`, { qty, purchasePrice }).then(r => r.data),
};

// ─── Customers ──────────────────────────────────────────────────────────────

export type CustomerPayload = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export const customersApi = {
  list:   ()               => api.get<Customer[]>('/customers').then(r => r.data),
  get:    (id: string)     => api.get<{ customer: Customer; history: Transaction[] }>(
    `/customers/${id}`
  ).then(r => r.data),
  create: (p: CustomerPayload)              => api.post<Customer>('/customers', p).then(r => r.data),
  update: (id: string, p: Partial<CustomerPayload>) =>
    api.put<Customer>(`/customers/${id}`, p).then(r => r.data),
  delete: (id: string)     => api.delete(`/customers/${id}`).then(r => r.data),
  adjust: (id: string, amount: number, type: 'IN' | 'OUT') =>
    api.post(`/customers/${id}/adjust`, { amount, type }).then(r => r.data),
};

// ─── Bills ──────────────────────────────────────────────────────────────────

export const billsApi = {
  listCompleted: ()          => api.get<any[]>('/bills?status=COMPLETED').then(r => r.data),
  listDrafts:    ()          => api.get<any[]>('/bills?status=DRAFT').then(r => r.data),
  create:        (p: BillPayload) => api.post<any>('/bills', p).then(r => r.data),
  deleteDraft:   (id: string)     => api.delete(`/bills/${id}`).then(r => r.data),
  cancel:        (id: string)     => api.post(`/bills/${id}/cancel`).then(r => r.data),
};

// ─── Transactions (Books) ───────────────────────────────────────────────────

export type TransactionPayload = {
  type: 'IN' | 'OUT';
  category: string;
  amount: number;
  details?: string;
};

export const transactionsApi = {
  list:   ()                       => api.get<Transaction[]>('/transactions').then(r => r.data),
  create: (p: TransactionPayload)  => api.post<Transaction>('/transactions', p).then(r => r.data),
};

// ─── Conversion ─────────────────────────────────────────────────────────────

export const conversionApi = {
  convert: (productId: string, fromQty: number, toUnit: string, toQty: number) =>
    api.post('/conversion', { productId, fromQty, toUnit, toQty }).then(r => r.data),
};
