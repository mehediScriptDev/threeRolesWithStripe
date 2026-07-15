export type CreateGearInput = {
  categoryId: string;
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock?: number;
  isAvailable?: boolean;
  specifications?: Record<string, unknown>;
  imageUrl?: string;
};

export type UpdateGearInput = {
  categoryId?: string;
  name?: string;
  description?: string;
  brand?: string;
  pricePerDay?: number;
  stock?: number;
  isAvailable?: boolean;
  specifications?: Record<string, unknown>;
  imageUrl?: string;
};
