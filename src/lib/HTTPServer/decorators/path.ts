import { URL } from 'url';

export function Path(value: string | URL) {
  return function <T extends Record<string, any>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): any {
    // console.log('descriptor', descriptor);
    console.log('descriptor.value', descriptor.value.arguments);
    // console.log('descriptor.value.name', descriptor.value.name);
    // console.log('descriptor.value.length', descriptor.value.length);

    (target as unknown as Record<string, any>).url = value;
    return target;
  };
}
