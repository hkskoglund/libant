/* global define: true, Uint8Array: true, clearTimeout: true, setTimeout: true, require: true,
module:true, process: true, window: true, clearInterval: true, setInterval: true, DataView: true */

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports, module) {

  'use strict';

  function Concat() {

  }

  Concat.prototype.concat = function(buffer1, buffer2) // https://gist.github.com/72lions/4528834
    {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);

      return tmp;
    };

  module.exports = Concat;
  return module.exports;
});