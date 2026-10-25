export interface FeedbackEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
}

export interface FeedbackItem {
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
  fromEmployee: FeedbackEmployee;
  toEmployee?: FeedbackEmployee;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
  byType: Array<{ type: string; _count: number }>;
}
