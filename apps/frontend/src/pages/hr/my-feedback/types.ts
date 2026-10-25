export interface FeedbackEmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Feedback {
  id: string;
  type: string;
  category?: string;
  content: string;
  rating?: number;
  isAnonymous: boolean;
  fromUserId: string;
  toUserId?: string;
  status: string;
  adminReply?: string;
  repliedAt?: string;
  repliedById?: string;
  fromEmployee: FeedbackEmployeeRef | null;
  toEmployee?: FeedbackEmployeeRef | null;
  createdAt: string;
}

export interface MyFeedbackStats {
  receivedCount: number;
  sentCount: number;
  avgRating: string;
}
