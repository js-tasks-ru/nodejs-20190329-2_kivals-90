const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  const messages = {
    200: 'File has deleted successfully',
    201: 'File has uploaded successfully',
    400: 'Incorrect file path',
    404: 'File not found',
    409: 'File has already existed',
    413: 'File is too big',
    500: 'Internal server error',
  };

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
