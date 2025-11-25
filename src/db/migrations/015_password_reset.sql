alter table users
  add column if not exists password_reset_token text,
  add column if not exists password_reset_token_expires_at timestamptz;

