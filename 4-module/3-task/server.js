const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const messages = require('../server_messages');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  const doResponse = (code) => {
    res.statusCode = code;
    res.end(messages[code]);
  };

  if (pathname.includes('\/')) {
    doResponse(400);
  }

  const deleteFile = (path) => {
    fs.unlink(path, handleDelete);
  };

  const handleDelete = (err) => {
    err ?
      doResponse(err.code === 'ENOENT'? 404 : 500) :
      doResponse(200);
  };

  switch (req.method) {
    case 'DELETE':
      deleteFile(filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
