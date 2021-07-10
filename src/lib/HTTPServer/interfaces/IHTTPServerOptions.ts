import { HTTPServerCerts } from './IHTTPServerCerts';

export interface HTTPServerOptions {
  certs?: HTTPServerCerts;
  port?: number;
  address?: string | string[];
  cors?: string | string[];
}
