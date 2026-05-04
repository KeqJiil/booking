import { Prisma } from '@prisma/client';

export const propertyViewSelect = Prisma.validator<Prisma.PropertySelect>()({
  id: true,
  name: true,
  description: true,
  country: true,
  city: true,
  price: true,
  address: true,
  maxGuests: true,
  hostId: true,
  host: { select: { name: true } },
  propertyType: { select: { name: true } },
});

export const propertyPlainSelect = Prisma.validator<Prisma.PropertySelect>()({
  id: true,
  name: true,
  description: true,
  country: true,
  city: true,
  status: true,
  price: true,
  address: true,
  maxGuests: true,
  hostId: true,
  typeId: true,
});
