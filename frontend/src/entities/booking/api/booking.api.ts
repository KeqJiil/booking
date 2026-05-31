import { api } from "@/shared/api/axios.interceptors";
import type { IBooking } from "../model/types";

// GET /bookings my bookings
export const getMyBookings = async (): Promise<IBooking[]> => {
  const { data } = await api.get("/bookings");
  return data;
};

// GET /bookings/:id role ADMIN
export const getBookingById = async (id: string): Promise<IBooking> => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

// GET /bookings/property/:id get property bookings
export const getPropertyBookings = async (
  propertyId: string,
): Promise<IBooking[]> => {
  const { data } = await api.get(`/bookings/property/${propertyId}`);
  return data;
};
