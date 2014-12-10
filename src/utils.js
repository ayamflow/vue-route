'use strict';

module.exports = {
    hasOwnProp: Object.prototype.hasOwnProperty,
    toString: Object.prototype.toString,
    concat: Array.prototype.concat,
    isString: function(str) {
      return this.toString.call(str).toLowerCase() == "[object string]";
    },
    isFunction: function(fn) {
      return this.toString.call(fn).toLowerCase() == "[object function]";
    }
};