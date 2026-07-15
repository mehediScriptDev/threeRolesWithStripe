export type CreateReviewInput = {
  rentalOrderId: string;
  gearItemId: string;
  rating: number;
  comment?: string;
};
