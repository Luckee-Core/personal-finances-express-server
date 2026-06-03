export type NotRecurring = {
  id: string;
  slug: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateNotRecurringInput = {
  slug: string;
  notes?: string | null;
};
