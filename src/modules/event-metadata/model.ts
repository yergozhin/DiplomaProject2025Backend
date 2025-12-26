export interface EventMetadata {
  id: string;
  eventId: string;
  posterImage: string | null;
  ticketLink: string | null;
  updatedAt: string;
}

export interface CreateMetadataFields {
  eventId: string;
  posterImage?: string | null;
  ticketLink?: string | null;
}

export interface UpdateMetadataFields {
  posterImage?: string | null;
  ticketLink?: string | null;
}

