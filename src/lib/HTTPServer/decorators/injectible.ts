import { ClientRequest } from 'http';

export function Injectable<T extends Record<string, any>>(props: T) {
  return function (target: ClientRequest): any {
    return Object.assign(target, props);
  };
}
