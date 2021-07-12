import { HTTPServer } from 'http-simple-node-server';

const server = new HTTPServer({
  port: 3000,
});
server.start();
