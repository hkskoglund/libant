/* global define: true */

if (typeof define !== 'function') { var define = require('amdefine')(module); }define(function (require,exports,module){  'use strict';  function ExtendedAssignment(extendedAssignment)  {    this.extendedAssignment = extendedAssignment || 0;  }  ExtendedAssignment.prototype.BACKGROUND_SCANNING_ENABLE= 0x01;       // 0000 0001  ExtendedAssignment.prototype.FREQUENCY_AGILITY_ENABLE = 0x04;        // 0000 0100  ExtendedAssignment.prototype.FAST_CHANNEL_INITIATION_ENABLE = 0x10;  // 0001 0000  ExtendedAssignment.prototype.ASYNCHRONOUS_TRANSMISSION_ENABLE= 0x20; // 0010 0000  ExtendedAssignment.prototype.enable = function (flag)  {    this.extendedAssignment |= flag;  };  ExtendedAssignment.prototype.toString = function()  {    var msg= '',        getStatus = function(flag,str)                        {                            var msg = '';                            msg +=  ((this.extendedAssignment & flag) !== 0) ? '+' : '-';                            msg += str;                            return msg;                        }.bind(this);    msg += getStatus(ExtendedAssignment.prototype.BACKGROUND_SCANNING_ENABLE,'Background Scanning|');    msg += getStatus(ExtendedAssignment.prototype.FREQUENCY_AGILITY_ENABLE,'Frequency Agility|');    msg += getStatus(ExtendedAssignment.prototype.FAST_CHANNEL_INITIATION_ENABLE,'Fast Channel Initiation|');    msg += getStatus(ExtendedAssignment.prototype.ASYNCHRONOUS_TRANSMISSION_ENABLE,'Asynchronous Transmission|');    msg += this.extendedAssignment.toString(2)+'b';    return msg;};  module.export = ExtendedAssignment;  return module.export;});