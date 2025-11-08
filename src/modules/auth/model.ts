export interface AuthUser {
  id: string;
  email: string;
  role: string;
  password_hash?: string;
  plo_status?: 'unverified' | 'verified' | null;
}


