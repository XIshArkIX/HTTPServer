import { HTTPServerOptions } from './interfaces/IHTTPServerOptions';
import { EventEmitter } from 'stream';
import cluster from 'cluster';
import https from 'https';
import http from 'http';
import fs, { PathLike } from 'fs';
import path from 'path';
import os from 'os';
import { EventNames, EventNamesEnum } from './enums/EventNames';
import { EventFunctionsType } from './enums/EventFunctions';
import { isNode } from './utils/isNode';
import HTTPHandler from '../HTTPHandler/HTTPHandler';
import { URL } from 'url';

const CPUS = os.cpus().length;

interface FileFunctions {
  [key: string]: HTTPHandler;
}

class HTTPServer {
  private mode: 'https' | 'http' = 'http';
  private key?: Buffer;
  private cert?: Buffer;
  private PORT: number;
  private address: string | string[];
  private cors?: string | string[];
  private server!: https.Server | http.Server;
  private flexibleRequest!: Record<string, any> & http.ClientRequest;
  private flexibleResponse!: Record<string, any> & http.ServerResponse;
  private handlers: FileFunctions = {};

  constructor(opts: HTTPServerOptions) {
    if (opts.certs) {
      const key =
        typeof opts.certs?.key === 'string'
          ? fs.readFileSync(opts.certs.key)
          : opts.certs?.key;
      if (!key) {
        throw new Error('Key is invalid');
      }

      const cert =
        typeof opts.certs?.cert === 'string'
          ? fs.readFileSync(opts.certs.cert)
          : opts.certs?.cert;
      if (!cert) {
        throw new Error('Cert is invalid');
      }

      this.key = key;
      this.cert = cert;
      this.mode = 'https';
    }

    this.PORT = opts.port || Number(process.env.PORT) || 3000;
    this.address = opts.address || '0.0.0.0';
    this.cors = opts.cors;
  }

  on<T extends EventNamesEnum>(
    event: T,
    listener: EventFunctionsType<T>
  ): this {
    this.server.on(event, listener);
    return this;
  }

  once<T extends EventNamesEnum>(
    event: T,
    listener: EventFunctionsType<T>
  ): this {
    this.server.on(event, listener);
    return this;
  }

  private loadHandlers = (dir: PathLike): void => {
    const filter = isNode()
      ? (file: string) => file.endsWith('js')
      : (file: string) => file.endsWith('ts');
    const handlers = fs.readdirSync(dir).filter(filter);

    handlers.forEach((file: string) => {
      const fullFilePath = path.resolve(process.cwd(), dir.toString(), file);
      const { default: FileFunction } = require(fullFilePath);

      console.log(
        'Adding new handler:',
        FileFunction.name,
        'for pid:',
        process.pid
      );

      this.handlers[FileFunction.name] = new FileFunction();
    });
  };

  private getHandler = (name: string): HTTPHandler | undefined => {
    return this.handlers[name];
  };

  private findHandlerByRegex = (url: string): HTTPHandler | undefined => {
    return Object.values(this.handlers).find(
      (handler) => handler.regex && handler.regex.test(url)
    );
  };

  private findHandlerByEnd = (url: string): HTTPHandler | undefined => {
    return Object.values(this.handlers).find(
      (handler) => handler.ends && url.endsWith(handler.ends)
    );
  };

  private findHandlerByURL = (url: string): HTTPHandler | undefined => {
    return Object.values(this.handlers).find((handler) => handler.url === url);
  };

  private ultimateHandler: EventFunctionsType<'request'> = (req, res) => {
    const buffer: Buffer[] = [];
    const parsedURL = new URL(
      this.mode +
        '://' +
        (req.host || `${this.address}:${this.PORT}`) +
        (req as unknown as Record<string, any>).url
    );

    if (parsedURL.pathname === '/') {
      parsedURL.pathname = '/index';
    }

    const handler =
      this.findHandlerByEnd(parsedURL.toString()) ||
      this.findHandlerByRegex(parsedURL.toString()) ||
      this.findHandlerByURL(parsedURL.pathname);

    if (!handler) {
      res.end('404');
      return;
    }

    handler.pre && handler.pre(req);

    req.on('data', (chunk) => buffer.push(chunk));
    req.on('end', () => {
      handler.on(req, res, Buffer.concat(buffer));
      handler.post && handler.post();
    });
  };

  start() {
    const { key, cert, PORT, address } = this;

    if (cluster.isMaster) {
      new Array(CPUS).fill(1).forEach(() => cluster.fork());
    } else {
      this.loadHandlers('./handlers');
      this.server =
        this.mode === 'http'
          ? http.createServer(
              { maxHeaderSize: 4096 },
              this.ultimateHandler as any
            )
          : https.createServer(
              {
                key,
                cert,
                minVersion: 'TLSv1.3',
                maxHeaderSize: 4096,
              },
              this.ultimateHandler as any
            );

      this.server.listen(
        {
          host: address,
          port: PORT,
        },
        () =>
          process.stdout.write(
            `Okay, we started.\n  PID: ${process.pid}\n  Mode: ${
              this.mode
            }\n  Total handlers: ${
              Object.keys(this.handlers).length
            }\n  Server address(es): ${
              Array.isArray(this.address)
                ? this.address.join(', ')
                : this.address
            }\n  Server port: ${this.PORT}\n  Press Ctrl+C to stop.\n`
          )
      );
    }
  }
}

export default HTTPServer;
