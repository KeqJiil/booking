import { Prisma } from '@prisma/client';

const propertyBaseSelect = {
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
} satisfies Prisma.PropertySelect;

export const propertyListSelect = Prisma.validator<Prisma.PropertySelect>()({
  ...propertyBaseSelect,
  images: { select: { url: true }, take: 1, orderBy: { id: 'asc' } },
});

export const propertyDetailSelect = Prisma.validator<Prisma.PropertySelect>()({
  ...propertyBaseSelect,
  images: { select: { url: true }, orderBy: { id: 'asc' } },
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
  images: {
    select: {
      url: true,
      id: true,
    },
  },
});
