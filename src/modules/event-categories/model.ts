export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateCategoryFields {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryFields {
  name?: string;
  description?: string | null;
}

export interface EventCategoryAssignment {
  id: string;
  eventId: string;
  categoryId: string;
  categoryName: string | null;
}

