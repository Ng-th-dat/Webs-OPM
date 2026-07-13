import type { Server } from './releaseSchedule';

export type TradeListingStatus = 'pending' | 'approved' | 'rejected' | 'sold';

export interface TradeListing {
  id: string;
  userId: string;
  title: string;
  description: string;
  priceText: string;
  server: Server;
  contactInfo: string;
  images: string[];
  status: TradeListingStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradeListingInput {
  title: string;
  description: string;
  priceText: string;
  server: Server;
  contactInfo: string;
  images: string[];
}
