export interface EventStatusHistory {
  id: string;
  eventId: string;
  status: 'draft' | 'published' | 'cancelled' | 'rejected' | 'completed';
  changedBy: string | null;
  changedByName: string | null;
  changeReason: string | null;
  changedAt: string;
}

export interface CreateStatusHistoryFields {
  eventId: string;
  status: 'draft' | 'published' | 'cancelled' | 'rejected' | 'completed';
  changedBy?: string | null;
  changeReason?: string | null;
}

