[![CodeQL](https://github.com/XIshArkIX/HTTPServer/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/XIshArkIX/HTTPServer/actions/workflows/codeql-analysis.yml)

# http-simple-node-server

Simplify creating http(s) servers

Installing:  
`npm i http-simple-node-server`  
_or_  
`yarn add http-simple-node-server`

Using:

```js
const HTTPServer = require('http-simple-node-server');
const fs = require('fs');

// opts are optional
const opts = {
  certs: {
    key: fs.readFileSync('path/to/key.pem'), // or just string like 'path/to/key.pem'
    cert: fs.readFileSync('path/to/cert.pem'),
  },
  port: process.env.PORT,
  address: '0.0.0.0',
  cors: '*',
};

const server = new HTTPServer(opts);
server.start();

// handle any critical error by using this code
process
  .on('uncaughtExceptionMonitor', (err) => console.error(err))
  .on('uncaughtException', (err) => console.error(err))
  .on('unhandledRejection', (r, p) => console.error(p, r));
```

By default it's scan `./handlers` folder and try to find any HTTPHandler class. You can view some in the `./examples` folder. With time this handlers will be growing.

Features:

- Multithreaded
- Do not cares about certs (can be easy be one of http/https)
- Pretty simple
