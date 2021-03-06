
var events = require('events');

module.exports = Transfer;

function Transfer (filesInfo) {

    this.id = shortId.generate();
    this.files = filesInfo;
    this.size = 0;
    this.encodedLength = 0;
    this.transferred = 0;
    this.progress = 0;
    this.start;
    this.complete;
    this.sender;

    var self = this;

    this.files.forEach(function (file) {
        debug('file', file);

        file.chunks = [];
        file.transferred = 0; // the number of bytes transferred
        file.progress = 0; // the progress percentage as an integer

        self.encodedLength += file.encodedLength;
        self.size += file.size;
    });

};

Transfer.prototype = Object.create(events.EventEmitter.prototype);

Transfer.prototype.chunk = function (fileId, chunkId, chunk) {

    if (!this.start) {
        this.start = Date.now();

        this.emit('start', this.start);
    }

    var file = this.files[fileId];

    file.transferred += chunk.length;
    this.transferred += chunk.length; 

    var filePercentage = Math.floor(file.transferred / file.encodedLength * 100);
    var overallPercentange = Math.floor(this.transferred / this.encodedLength * 100)
    
    if (overallPercentange > this.progress) {
        this.progress = overallPercentange;
    }

    if (filePercentage > file.progress) {
        file.progress = filePercentage;
        
        this.emit('progress', fileId);
    }

    if (file.transferred === file.encodedLength) {
        this.emit('file-complete', fileId);
    }

    if (this.transferred === this.encodedLength) {
        this.complete = Date.now();
        this.emit('complete', this.complete);
        debug('transfer %s complete', this.id);
    }

};
