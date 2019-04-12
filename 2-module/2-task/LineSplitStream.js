const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.dataBuffer = '';
  }

  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    if (!data.includes(os.EOL)) {
      this.dataBuffer += data;
    } else {
      const lines = (this.dataBuffer + chunk.toString()).split(os.EOL);
      for (const line of lines) {
        this.push(line);
      }
    }
    callback();
  }

  _flush(callback) {
    callback();
  }
}

module.exports = LineSplitStream;
