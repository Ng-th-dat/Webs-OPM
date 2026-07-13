export interface FeedbackInput {
  message: string;
  contact?: string;
}

export interface FeedbackEntry {
  id: string;
  message: string;
  contact?: string;
  createdAt: string;
}
