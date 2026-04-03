export interface Customer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
}

export interface Product {
  _id: string;
  name: string;
  unitName: string;
  freeStock: number;
  taxRate: number;
  versions: Version[];
}

export interface Version {
  _id: string;
  productId: string;
  name: string;
  multiplier: number;
  price: number;
}

export interface Transaction {
  _id: string;
  date: string;
  type: 'IN' | 'OUT';
  category: string;
  amount: number;
  customerId?: Customer;
  details: string;
}

export interface BillItem {
  versionId: string;
  versionName?: string;
  productName?: string;
  qty: number;
  price: number;
  taxAmount?: number;
}

export interface Bill {
  _id: string;
  customerId?: Customer;
  customerName?: string;
  customerPhone?: string;
  paymentType: 'CASH' | 'UDHAAR';
  items: BillItem[];
  subTotal: number;
  taxAmount: number;
  discount?: {
    type: 'FLAT' | 'PERCENTAGE';
    value: number;
    amount: number;
  };
  total: number;
  date: string;
  transactionId?: string;
  cancelled: boolean;
  status: 'DRAFT' | 'COMPLETED';
}

export interface DashboardMetrics {
  salesToday: number;
  salesWeek: number;
  lowStock: Product[];
  recentActivity: Transaction[];
  outstandingDebt: number;
}

export interface AuthUser {
  token: string;
  username: string;
}
