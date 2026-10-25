export interface FeedbackFormData {
  toEmployeeId: string;
  type: string;
  category: string;
  content: string;
  rating: number;
  isAnonymous: boolean;
}

export interface FeedbackEmployee {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  position?: { title: string };
  department?: { name: string };
}
