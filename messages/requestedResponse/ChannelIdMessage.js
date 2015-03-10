/* global define: true, DataView: true */

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}
define(function(require, exports, module) {
  'use strict';

  var Message = require('../Message'),
    ChannelId = require('../../channel/channelId');

  function ChannelIdMessage(data) {
    Message.call(this, data);
  }

  ChannelIdMessage.prototype = Object.create(Message.prototype);
  ChannelIdMessage.prototype.constructor = ChannelIdMessage;

  ChannelIdMessage.prototype.decode = function() {
    var deviceNum = (new DataView(this.content.buffer)).getUint16(this.content.byteOffset + 1, true),
      deviceType = this.content[3],
      transmissionType = this.content[4];

    this.channelId = new ChannelId(deviceNum, deviceType, transmissionType);
  };

  ChannelId.prototype.getId = function() {
    return this.channelId;
  };

  ChannelIdMessage.prototype.toString = function() {
    return Message.prototype.toString.call(this) + " Ch " + this.channel + " " + this.channelId.toString();
  };

  module.exports = ChannelIdMessage;
  return module.exports;
});