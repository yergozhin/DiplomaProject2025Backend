
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
  Admin: {
    Base: '/admin',
    Plos: '/plos',
    PloStatus: '/plos/:ploId/status',
  },
  Plos: {
    Base: '/plos',
  },
  Users: {
    Base: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
} as const;
