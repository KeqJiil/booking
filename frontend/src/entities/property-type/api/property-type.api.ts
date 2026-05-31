import { api } from '@/shared/api/axios.interceptors';
import type { IPropertyType } from '../model/types';

// GET /property-type — get all property types (public)
export const getPropertyTypes = async (): Promise<IPropertyType[]> => {
  const { data } = await api.get('/property-type');
  return data;
};

// GET /property-type/:id — get property type by ID
export const getPropertyTypeById = async (id: string): Promise<IPropertyType> => {
  const { data } = await api.get(`/property-type/${id}`);
  return data;
};

// GET /property-type/name/:name — get property type by name
export const getPropertyTypeByName = async (name: string): Promise<IPropertyType> => {
  const { data } = await api.get(`/property-type/name/${name}`);
  return data;
};
