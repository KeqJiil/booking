import { api } from '@/shared/api/axios.interceptors';
import type { IBillingAccount, IPayment } from '../model/types';

// GET /billing — get user billing info (role: USER)
export const getBillingInfo = async (): Promise<IBillingAccount> => {
  const { data } = await api.get('/billing');
  return data;
};

// GET /billing/:id — get specific payment details (role: USER)
export const getPaymentById = async (id: string): Promise<IPayment> => {
  const { data } = await api.get(`/billing/${id}`);
  return data;
};
