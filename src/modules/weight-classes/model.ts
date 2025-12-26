export interface WeightClass {
  id: string;
  name: string;
  minWeightKg: number | null;
  maxWeightKg: number | null;
  description: string | null;
  createdAt: string | null;
}

export interface CreateWeightClassFields {
  name: string;
  minWeightKg?: number | null;
  maxWeightKg?: number | null;
  description?: string | null;
}

export interface UpdateWeightClassFields {
  name?: string;
  minWeightKg?: number | null;
  maxWeightKg?: number | null;
  description?: string | null;
}

