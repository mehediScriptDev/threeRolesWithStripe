import type { RentalOrderStatus } from "../../../generated/prisma/client.js";

export type RentalItemInput = {
  gearItemId: string;
  quantity: number;
};

export type CreateRentalInput = {
  startDate: string;
  endDate: string;
  items: RentalItemInput[];
};

export type UpdateOrderStatusInput = {
  status: RentalOrderStatus;
};
