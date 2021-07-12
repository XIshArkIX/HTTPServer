import HTTPHandler from '../src/lib/HTTPHandler/HTTPHandler';
import { EventFunctionsType } from '../src/lib/HTTPServer/enums/EventFunctions';
import Parser from 'rss-parser';

const parser = new Parser();

export default class RSSHandler implements HTTPHandler {
  url = '/api/v1/rss/parser';
  name = 'RSS-Handler';

  on: EventFunctionsType<'request'> = (req, res, data) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Server', 'simple-http-node-server');

    const logicStart = Date.now();
    let reqEnd = 0;

    if (req.method !== 'POST') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Server-Timing', `logic;dur=${Date.now() - logicStart}`);
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    const jsonReq = this.parseJSON(data!.toString());

    if (Object.keys(jsonReq).length === 0) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Server-Timing', `logic;dur=${Date.now() - logicStart}`);
      res.writeHead(400);
      res.end(
        `Bad body.\nExample:\n${JSON.stringify(
          { url: 'http://www.reddit.com/.rss' },
          void 0,
          2
        )}`
      );
      return;
    }

    if (!jsonReq['url']) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Server-Timing', `logic;dur=${Date.now() - logicStart}`);
      res.writeHead(422);
      res.end('Unprocessable Entity');
      return;
    }

    const rssStart = Date.now();

    parser
      .parseURL(jsonReq.url)
      .then((obj: Record<string, any>) => {
        reqEnd = Date.now();
        res.setHeader('Content-Type', 'text/json');
        res.setHeader(
          'Server-Timing',
          `logic;dur=${reqEnd - logicStart}, rss;dur=${reqEnd - rssStart}`
        );
        res.writeHead(200);
        res.end(obj);
      })
      .catch((err: Error) => {
        reqEnd = Date.now();
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader(
          'Server-Timing',
          `logic;dur=${reqEnd - logicStart}, rss;dur=${reqEnd - rssStart}`
        );
        res.writeHead(500);
        res.end('Internal server error');
        console.error('Error:', err);
        console.error('Request body:', jsonReq);
      });
  };

  parseJSON = (data: string) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  };
}
