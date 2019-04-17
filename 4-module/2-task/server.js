const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
  const limitStream = new LimitSizeStream({limit: 1024*1024});

  const messages = {
    200: 'File has deleted successfully',
    201: 'File has uploaded successfully',
    400: 'Incorrect file path',
    404: 'File not found',
    409: 'File has already existed',
    413: 'File is too big',
    500: 'Internal server error',
  };
  const doResponse = (errorCode) => {
    res.statusCode = errorCode;
    res.end(messages[errorCode]);
  };

  const handleWriteError = ({code}) => {
    const errorCode = code === 'EEXIST'? 409 : 500;
    doResponse(errorCode);
    if (errorCode === 500) {
      deleteFile(filepath);
    }
  };

  const handleLimitError = ({code}) => {
    const errorCode = code === 'LIMIT_EXCEEDED'? 413 : 500;
    doResponse(errorCode);
    deleteFile(filepath);
  };

  const deleteFile = (path) => {
    fs.unlink(path, () => {});
  };

  res.on('close', () => {
    if (!res.finished) deleteFile(filepath);
  });

  if (pathname.includes('\/')) {
    doResponse(400);
  }

  switch (req.method) {
    case 'POST':
      req
        .pipe(limitStream)
        .on('error', handleLimitError)
        .pipe(writeStream)
        .on('error', handleWriteError)
        .on('close', () => doResponse(201));
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
