export const Roles = {
  Fighter: 'fighter',
  PLO: 'plo',
  Spectator: 'spectator',
  Admin: 'admin',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

