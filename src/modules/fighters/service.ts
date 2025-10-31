import * as repo from './repo';

export function list() {
  return repo.all();
}

export function edit(id: string, name: string, weightClass: string) {
  return repo.update(id, name, weightClass);
}

export function getById(id: string) {
  return repo.getById(id);
}


