export const enum EventNames {
  REQUEST = 'request',
  RESPONSE = 'response',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}

export type EventNamesEnum = `${EventNames}`;
