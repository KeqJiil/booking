import { api } from '@/shared/api/axios.interceptors';
import type { IProperty, IPropertySearchParams } from '../model/types';

// GET /property — search/list properties (public, no auth required)
export const getProperties = async (params?: IPropertySearchParams): Promise<IProperty[]> => {
  const { data } = await api.get('/property', { params });
  return data;
};

// GET /property/:id — get property by ID (public)
export const getPropertyById = async (id: string): Promise<IProperty> => {
  const { data } = await api.get(`/property/${id}`);
  return data;
};
