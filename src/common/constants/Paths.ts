
export default {
  Base: '/api',
  Auth: {
    Base: '/auth',
    Register: '/register',
    Login: '/login',
  },
  Fighters: {
    Base: '/fighters',
  },
  Fights: {
    Base: '/fights',
  },
  Events: {
    Base: '/events',
  },
  Offers: {
    Base: '/offers',
  },
  Users: {
    Base: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
} as const;
