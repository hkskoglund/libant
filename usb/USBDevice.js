﻿
define(['logger','events'],function (Logger,EventEmitter) {
    'use strict'

// Abstract USB device
function USBDevice(options) {
   EventEmitter.call(this);
    // Stream inherits from event emitter
//    Duplex.call(this, options);
//    this._burstBuffer = new Buffer(0);
    this.options = options;
    this.log = new Logger(options);
  
}

// Inherit from event emitter
USBDevice.prototype = Object.create(EventEmitter.prototype, { constructor : { value : USBDevice,
                                                                        enumerable : false,
                                                                        writeable : true,
                                                                        configurable : true } });
//util.inherits(USBDevice, Duplex);
//'function (ctor, superCtor) {\n  ctor.super_ = superCtor;\n  ctor.prototype = Object.create(superCtor.prototype, {\n
//constructor: {\n      value: ctor,\n      enumerable: false,\n      writable: true,\n      configurable: true\n    }\n
//});\n}'

// for event emitter
USBDevice.prototype.EVENT = {

    LOG: 'log',
    ERROR: 'error',
    CLOSED : 'closed'
   
};

USBDevice.prototype.ANT_DEVICE_TIMEOUT = 12; // 11.11 ms to transfer 64 bytes (max. endpoint size) at 57600 bit/sec  -> 64 * 10 (1+8+1) bit = 640bit -> (640 / 57600 ) *1000 ms = 11.11 ms 

USBDevice.prototype.setBurstMode = function (value) {
    this.burstMode = value;
};

USBDevice.prototype.init = function (callback) {
    throw new Error('Not implemented - should be overridden in descendat objects in the prototype chain');
};

USBDevice.prototype.exit = function (callback) {

    throw new Error('Not implemented - should be overridden in descendat objects in the prototype chain');
};


// Sets device timeout in ms.
USBDevice.prototype.setDeviceTimeout = function (timeout) {
    throw new Error('Func. should be overridden in descendant objects');
};

USBDevice.prototype.listen = function (successCallback) {
    throw new Error('Func. should be overridden in descendant objects');
};

USBDevice.prototype.transfer = function (chunk, successCallback) {
    throw new Error('Func. should be overridden in descendant objects');
};

USBDevice.prototype.getDeviceWatcher = function () {
    //throw new Error('Func. should be overridden in descendants objects');
    return undefined;
};

USBDevice.prototype.getDevicesFromManifest = function ()
{
    // If no deviceId available, it will try to automatically connect to the first enumerated device that matches a known ANT device

    return [

        { name: 'ANT USB-2 Stick', id: undefined, vendorId: 0x0FCF, productId: 0x1008 },

        { name: 'ANT USB-m Stick', id: undefined, vendorId: 0x0FCF, productId: 0x1009 }
    ];
}
    
return USBDevice;
});