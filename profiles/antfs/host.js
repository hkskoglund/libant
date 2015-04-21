/* global define: true, Uint8Array: true, clearTimeout: true, setTimeout: true, require: true,
module:true, process: true, window: true, clearInterval: true, setInterval: true, DataView: true */

/*jshint -W097 */
'use strict';

var Channel = require('../../channel/channel'),
    ChannelResponseEvent = require('../../channel/channelResponseEvent'),
  ClientBeacon = require('./lib/layer/clientBeacon'),
  State = require('./lib/layer/util/state'),

  // Layers

  LinkManager = require('./lib/layer/linkManager'),
  AuthenticationManager = require('./lib/layer/authenticationManager'),
  TransportManager = require('./lib/layer/transportManager'),

  AuthenticateRequest = require('./lib/request-response/authenticateRequest'),
  DownloadRequest  = require('./lib/request-response/downloadRequest'),
  EraseRequest = require('./lib/request-response/eraseRequest');

function Host(options, host, channel, net, deviceNumber, hostname, download, erase,ls) {

  Channel.call(this, options, host, channel, net);

  // ANT-FS Technical specification, p.44 10.2 Host Device ANT Configuration

  this.key = this.NET.KEY.ANTFS;
  this.frequency = this.NET.FREQUENCY.ANTFS;
  this.period = this.NET.PERIOD.ANTFS;
  this.lowPrioritySearchTimeout = 0xFF; // INFINITE

  if (typeof deviceNumber === 'number') // Search for specific device
   this.setId(deviceNumber,0,0);

  if (typeof hostname === 'string')
   this.hostname = hostname;
  else
   this.hostname = 'antfsjs';

  if (this.log.logging)
    this.log.log('log','Hostname ' + this.hostname);

  this.on('data', this.onBroadcast.bind(this)); // decodes client beacon

  this.on('burst', this.onBurst.bind(this)); // decodes client beacon

  this.on('beacon', this.onBeacon.bind(this));


  this.on('reset', this.onReset.bind(this));

  this.on('directory', function _onDirectory(lsl) {
   if (ls)
      console.log(lsl);
  });

  // Initialize layer specific event handlers at the tail of event callbacks
  // Host has priority (in front of event callbacks) because it handles decoding of the client beacon

  this.linkManager = new LinkManager(this);

  this.authenticationManager = new AuthenticationManager(this);

  this.transportManager = new TransportManager(this, download,erase,ls);

  this.beacon = new ClientBeacon();

  this.on('EVENT_TRANSFER_TX_FAILED', this.sendRequest);
  this.on('EVENT_TRANSFER_RX_FAILED', this.sendRequest);
  this.on('EVENT_TRANSFER_TX_COMPLETED', this.onTxCompleted);

}

Host.prototype = Object.create(Channel.prototype);
Host.prototype.constructor = Channel;

Host.prototype.onBeacon = function(beacon) {
  var NO_ERROR;

  clearTimeout(this.beaconTimeout);

  this.beaconTimeout = setTimeout(function _beaconTimeout ()
  {
    if (this.log.logging)
      this.log.log('log','Client beacon timeout');

    this.emit('reset');
  }.bind(this), 25000);

  if (this.log.logging)
    this.log.log('log', this.beacon.toString());


  // Client dropped to link
  if (!this.layerState.isLink() && this.beacon.clientDeviceState.isLink())
  {
    if (this.log.logging)
      this.log.log('log','Client dropped to LINK, Host ',this.layerState.toString(),'Client',this.beacon.clientDeviceState.toString());

    this.emit('reset');
  }
  else
    this.sendRequest(NO_ERROR,'Next client beacon');
};

Host.prototype.onBroadcast = function(broadcast) {

  var res = this.beacon.decode(broadcast.payload);

  if (res === -1)

  {
    if (this.log.logging) {
      this.log.log('log', 'Broadcast not a valid beacon. Ignoring.');
    }
  } else {

    this.emit('beacon', this.beacon);
  }

};

Host.prototype.onBurst = function(burst) {

  clearTimeout(this.burstResponseTimeout);

  this.session.response = burst;

  var res = this.beacon.decode(burst.subarray(0, ClientBeacon.prototype.PAYLOAD_LENGTH));

  if (res === -1)

  {
    if (this.log.logging) {
      this.log.log('warn', 'Expected client beacon as the first packet of the burst');
    }
  } else {

    this.emit('beacon', this.beacon);

  }

};

Host.prototype.onTxCompleted = function ()
{
  this.session.TxCompleted = true;
};

Host.prototype.getHostname = function() {
  return this.hostname;
};

Host.prototype.getClientSerialNumber = function() {
  return this.authenticationManager.clientSerialNumber;
};

Host.prototype.getClientFriendlyname = function() {
  return this.authenticationManager.clientFriendlyname;
};

Host.prototype.onReset = function(err, callback) {

  clearTimeout(this.beaconTimeout);
  clearTimeout(this.burstResponseTimeout);
  this.session = {};

};

Host.prototype.connect = function(callback) {

  var onConnecting = function _onConnecting(err, msg) {

    if (!err) {
      this.layerState = new State(State.prototype.LINK);
      if (this.log.logging)
        this.log.log('log', 'Connecting, host state now ' + this.layerState.toString());
    }
    callback(err, msg);

  }.bind(this);

  this.getSerialNumber(function _getSN(err, serialNumberMsg) {

    if (!err) {
      this.setHostSerialNumber(serialNumberMsg.serialNumber);
    } else {
      this.setHostSerialNumber(0);
    }

    Channel.prototype.connect.call(this, onConnecting);

  }.bind(this));

};

Host.prototype.setHostSerialNumber = function(serialNumber) {
  this.hostSerialNumber = serialNumber;
};

Host.prototype.getHostSerialNumber = function() {
  return this.hostSerialNumber;
};

Host.prototype.initRequest = function (request, callback)
{
  var NO_ERROR;

  var serializedRequest = request.serialize();

  this.session = {};

  this.session.request = request;

  // Spec 12.2 "If a client responds with one of the ANT-FS response messages listed below,
  // this response will be appended to the beacon and sent as a burst transfer" -> there
  // is a possibility of failed receive of burst (EVENT_TRANSFER_RX_FAILED)

  this.session.hasBurstResponse = [0x04,0x09,0x0A,0x0B,0x0C].indexOf(request.ID) !== -1;
  if (this.session.hasBurstResponse)
   this.session.burstResponseTimeoutFired = false;

  this.session.retry = -1;

  this.session.TxCompleted = false; // set to true in onTxCompleted callback

  if (serializedRequest.length <= 8)
    this.session.sendFunc = Channel.prototype.sendAcknowledged.bind(this, serializedRequest, callback);
  else
    this.session.sendFunc = Channel.prototype.sendBurst.bind(this, serializedRequest, callback);

  if (this.log.logging)
    this.log.log('log','Init request',this.session);

  this.sendRequest(NO_ERROR,'Init request');
};

Host.prototype.sendRequest = function (e,m)
{
  var err,
      NO_ERROR,
      MAX_RETRIES = 7,
      client = this.beacon.clientDeviceState,
      retryMsg,
      burstResponseTimeout = 16 * ( this.period / 32768) * 1000 + 1000;

    // Spec. 9.4 "The busy state is not cleared from the client beacon until after the appropiate response has been sent"
    // "The host shall not send a request to the client while the beacon indicates it is in the busy state"

    // Check for tracking channel - Channel has infinite timeout, only drops to search in EVENT_RX_FAILED_GOTO_SEARCH

    // Don't send new request if another request is in progress

    if (!client.isBusy() && this.isTracking() && !this.isTransferInProgress() && this.session && this.session.request &&
         (
           ( this.session.hasBurstResponse && !this.session.response && !this.session.TxCompleted) ||
           (!this.session.hasBurstResponse &&                           !this.session.TxCompleted) ||
           ( this.session.hasBurstResponse && !this.session.response &&  this.session.TxCompleted && this.session.burstResponseTimeoutFired) ||
           ( this.session.hasBurstResponse && !this.session.response &&  this.session.TxCompleted && (m instanceof ChannelResponseEvent && m.isTransferRxFailed()))
         )
       )
    {

      if (++this.session.retry <= MAX_RETRIES)
      {

        if (this.session.retry)
        {

          if (this.log.logging) {
            retryMsg = 'Retry ' + this.session.retry + ' sending request';
            if (m)
              retryMsg += ' ' + m.toString();

            this.log.log('log',retryMsg,this.session,m);
          }

        }

        clearTimeout(this.burstResponseTimeout);

        if (this.session.hasBurstResponse)
        {

          // It's possible that a request is sent, but no burst response is received. In that case, the request must be retried.
          // During pairing, user intervention is necessary, so don't enable timeout

          if (!(this.session.request instanceof AuthenticateRequest && this.session.request.commandType === AuthenticateRequest.prototype.REQUEST_PAIRING) ||
              !(this.session.request instanceof AuthenticateRequest && this.session.request.commandType === AuthenticateRequest.prototype.CLIENT_SERIAL_NUMBER))
          {

             this.session.burstResponseTimeoutFired = false;
             this.burstResponseTimeout = setTimeout(function _burstResponseTimeout ()
                                                    {
                                                      this.session.burstResponseTimeoutFired = true;
                                                      this.sendRequest.call(this,NO_ERROR,'Client burst response timeout ' + burstResponseTimeout + ' ms');
                                                    }.bind(this), burstResponseTimeout);
          }
        } else
         {
           clearTimeout(this.burstResponseTimeout);
           this.burstResponseTimeout = undefined;
         }

        this.session.sendFunc();
      }

      else
        {
          err = new Error('Max retries ' + MAX_RETRIES + ' reached for request ' + this.session.request.toString());

          if (this.session.request instanceof DownloadRequest)
            this.emit('download', err);
          else if (this.session.request instanceof EraseRequest)
            this.emit('erase',err);
        }

  }

};

// Override Channel
Host.prototype.sendAcknowledged = function(request, callback) {
  this.initRequest(request, callback);
};

// Override Channel
Host.prototype.sendBurst = function(request, callback) {
  this.initRequest(request,callback);
};

Host.prototype.disconnect = function (callback)
{
var onDisconnect = function _onDisconnect(e,m)
  {
    this.removeAllListeners('beacon');

    this.emit('reset');

    if (typeof callback === 'function')
      callback.call(this,arguments);
  }.bind(this);


  this.linkManager.disconnect(onDisconnect);
};

module.exports = Host;
return module.exports;
