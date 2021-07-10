import https from 'https';
import http from 'http';
import { Socket } from 'net';

const EventFunctions = {
  request: <T, U = T extends Record<string, any> ? Record<string, any> : {}>(
    req: http.ClientRequest & U,
    res: http.ServerResponse & U,
    data?: Buffer
  ): void => {},
  response: <T, U = T extends Record<string, any> ? Record<string, any> : {}>(
    res: http.ServerResponse & U
  ): void => {},
  connect: <T, U = T extends Record<string, any> ? Record<string, any> : {}>(
    req: http.ClientRequest & U
  ): void => {},
  disconnect: () => {},
};

export type EventFunctionsType<T extends keyof typeof EventFunctions> = Pick<
  typeof EventFunctions,
  T
>[T];
