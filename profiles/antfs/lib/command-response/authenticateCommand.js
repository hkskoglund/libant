/* global define: true, Uint8Array: true, clearTimeout: true, setTimeout: true, require: true,
module:true, process: true, window: true, clearInterval: true, setInterval: true, DataView: true */

  'use strict';

  function AuthenticateCommand(commandType, authenticationStringLength, hostSerialNumber) {
    this.commandType = commandType || AuthenticateCommand.prototype.PROCEED_TO_TRANSPORT;
    this.authenticationStringLength = authenticationStringLength || 0;
    this.hostSerialNumber = hostSerialNumber || 0;

  }

  AuthenticateCommand.prototype.PROCEED_TO_TRANSPORT = 0x00; // Pass-through
  AuthenticateCommand.prototype.REQUEST_CLIENT_DEVICE_SERIAL_NUMBER = 0x01;
  AuthenticateCommand.prototype.REQUEST_PAIRING = 0x02;
  AuthenticateCommand.prototype.REQUEST_PASSKEY_EXCHANGE = 0x03;

  AuthenticateCommand.prototype.ID = 0x04;

  AuthenticateCommand.prototype.setRequestProceedToTransport = function(hostSerialNumber) {
    this.request(AuthenticateCommand.prototype.PROCEED_TO_TRANSPORT, hostSerialNumber);
  };

  AuthenticateCommand.prototype.setRequestClientSerialNumber = function(hostSerialNumber) {
    this.request(AuthenticateCommand.prototype.REQUEST_CLIENT_DEVICE_SERIAL_NUMBER, hostSerialNumber);
  };

  AuthenticateCommand.prototype.setRequestPairing = function(hostSerialNumber, hostname) {
    console.log('hostname is now', hostname);
    if (hostname)
      this.hostname = hostname;
    this.request(AuthenticateCommand.prototype.REQUEST_PAIRING, hostSerialNumber, hostname);
  };

  AuthenticateCommand.prototype.setRequestPasskeyExchange = function(hostSerialNumber, passkey) {
    this.request(AuthenticateCommand.prototype.REQUEST_PASSKEY_EXCHANGE, hostSerialNumber, passkey);
  };

  AuthenticateCommand.prototype.request = function(commandType, hostSerialNumber, authenticationString) {
    this.commandType = commandType;

    if (authenticationString) {
      this.authenticationStringLength = authenticationString.length;
      this.authenticationString = authenticationString;
    } else
      this.authenticationStringLength = 0;

    this.hostSerialNumber = hostSerialNumber;
  };

  AuthenticateCommand.prototype.serialize = function() {
    var command = new Uint8Array(8 + this.authenticationStringLength),
      dv = new DataView(command.buffer),
      byteNr;

    command[0] = 0x44; // ANT-FS COMMAND message
    command[1] = this.ID;
    command[2] = this.commandType;
    command[3] = this.authenticationStringLength;
    dv.setUint32(4, this.hostSerialNumber, true);

    // Host friendly name if pairing, client passkey if paskey exchange

    if (this.authenticationStringLength) {
      for (byteNr = 0; byteNr <= this.authenticationStringLength; byteNr++) {
        command[8 + byteNr] = this.authenticationString.charCodeAt(byteNr);
      }
    }

    return command;
  };

  AuthenticateCommand.prototype.toString = function() {
    var cmdType;

    switch (this.commandType) {
      case AuthenticateCommand.prototype.PROCEED_TO_TRANSPORT:
        cmdType = 'proceed to transport';
        break;
      case AuthenticateCommand.prototype.REQUEST_CLIENT_DEVICE_SERIAL_NUMBER:
        cmdType = 'get client serial number';
        break;
      case AuthenticateCommand.prototype.REQUEST_PAIRING:
        cmdType = 'pairing';
        if (this.authenticationStringLength)
          cmdType += ', hostname ' + this.authenticationString;
        break;
      case AuthenticateCommand.prototype.REQUEST_PASSKEY_EXCHANGE:
        cmdType = 'passkey exchange';
        break;
    }

    return 'AUTHENTICATE ' + cmdType + ' host serial number ' + this.hostSerialNumber;
  };

  module.exports = AuthenticateCommand;
  return module.exports;
