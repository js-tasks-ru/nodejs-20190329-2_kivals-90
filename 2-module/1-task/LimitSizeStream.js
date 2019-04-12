const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.contentSize = 0;
  }

  _transform(chunk, encoding, callback) {
    this.contentSize += chunk.byteLength;
    if (this.contentSize > this.limit) {
      this.emit('error', new LimitExceededError());
    }
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
