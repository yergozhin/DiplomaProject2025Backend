export type Fight = {
  id: string;
  fighterAId: string;
  fighterBId: string;
  status: 'requested' | 'accepted' | 'scheduled' | 'deleted';
};


