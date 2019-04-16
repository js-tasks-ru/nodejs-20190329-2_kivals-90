const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const limitStream = new LimitSizeStream({
    limit: 1024 * 1024,
  });
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.includes('\/')) {
    res.statusCode = 400;
    res.end('incorrect file path');
  }

  const wstream = fs.createWriteStream(filepath, {
    flags: 'wx',
  });

  wstream.on('error', (err) => {
    if (err.code === 'EEXIST') {
      res.statusCode = 409;
      res.end('The file has already existed');
    } else {
      cleanUp();
    }
  });
  limitStream.on('error', (err) => {
    cleanUp();
    res.statusCode = 413;
    res.end('Oversize');
  });
  switch (req.method) {
    case 'POST':
      req.pipe(limitStream).pipe(wstream);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }

  function cleanUp() {
    fs.unlink(wstream.path, (err) => {
      if (err && err.code === 'ENOENT') {}
      else if (err) {
        throw err;
      }
    });
  }
});

module.exports = server;
