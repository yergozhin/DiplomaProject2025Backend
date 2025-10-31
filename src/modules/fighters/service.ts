import * as repo from './repo';

export function list() {
  return repo.all();
}

export function add(name: string, weightClass: string) {
  return repo.create(name, weightClass);
}

export function edit(id: string, name: string, weightClass: string) {
  return repo.update(id, name, weightClass);
}

export function del(id: string) {
  return repo.remove(id);
}


