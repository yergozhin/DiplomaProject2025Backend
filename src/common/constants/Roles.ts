export const Roles = {
  Fighter: 'fighter',
  PLO: 'plo',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

