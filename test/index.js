'use strict';

// Phantomjs bind function
if(!Function.prototype.bind) {
  Function.prototype.bind = require("function-bind");
}

require('./common.js');