/* global define: true */

if (typeof define !== 'function') { var define = require('amdefine')(module); }define(function (require,exports,module){  'use strict';  function ChannelType(type)  {    this.type = type;  }  ChannelType.prototype.BIDIRECTIONAL_SLAVE = 0x00;  ChannelType.prototype.BIDIRECTIONAL_MASTER = 0x10;  ChannelType.prototype.SHARED_BIDIRECTIONAL_SLAVE =  0x20;  ChannelType.prototype.SHARED_BIDIRECTIONAL_MASTER = 0x30;  ChannelType.prototype.SLAVE_RECEIVE_ONLY = 0x40;  ChannelType.prototype.MASTER_TRANSMIT_ONLY = 0x50;  ChannelType.prototype.getRawValue = function ()  {    return this.type;  };  ChannelType.prototype.toString = function ()  {    var types = {      0x00 : 'Bidirectional SLAVE',      0x10 : 'Bidirectional MASTER',      0x20 : 'Shared bidirectional SLAVE',      0x30 : 'Shared bidirectional MASTER',      0x40 : 'SLAVE receive only (diagnostic)',      0x50 : 'MASTER Transmit only (legacy)'    };    return types[this.type];  };  module.export = ChannelType;  return module.export;});