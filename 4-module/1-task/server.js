const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);
  const readStream = fs.createReadStream(filepath);
  if (pathname.includes('\/')) {
    res.statusCode = 400;
    res.end('incorrect file path');
  }
  readStream.on('error', (err) => {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
      res.end('Not found');
    }
    res.statusCode = 500;
    res.end('internal server error');
  });
  switch (req.method) {
    case 'GET':
      readStream.pipe(res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
