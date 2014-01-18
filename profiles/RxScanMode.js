﻿/* global define: true */

define(function (require, exports, module) {
    'use strict';

    //
    var DeviceProfile = require('profiles/deviceProfile'),
        setting = require('settings'),
        TEMPProfile = require('profiles/environment/deviceProfile_ENVIRONMENT'),
        HRMProfile = require('profiles/hrm/deviceProfile_HRM'),
        SDMProfile = require('profiles/sdm/deviceProfile_SDM'),
        SPDCADProfile = require('profiles/spdcad/deviceProfile_SPDCAD');


    function RxScanMode(configuration) {
        var devNum = '*',
            devType = '*',
            transType = '*';

        DeviceProfile.call(this, configuration);

        if (configuration.channelId) {
            devNum = configuration.channelId.deviceNumber || '*';
            devType = configuration.channelId.deviceType || '*';
            transType = configuration.channelId.transmissionType || '*';
        }

        this.addConfiguration("slave", {
            description: "Slave configuration Rx Scan Mode for ANT+ devices",
            networkKey: setting.networkKey["ANT+"],
            channelType: "slave",
            channelId: { deviceNumber: devNum, deviceType: devType, transmissionType: transType },
            RFfrequency: setting.RFfrequency["ANT+"],     // 2457 Mhz ANT +
            RxScanMode: true
        });

        this.addConfiguration("slave only", {
            description: "Slave only configuration Rx Scan Mode for ANT+ devices",
            networkKey: setting.networkKey["ANT+"],
            channelType: "slave only",
            channelId: { deviceNumber: devNum, deviceType: devType, transmissionType: transType },
            RFfrequency: setting.RFfrequency["ANT+"],     // 2457 Mhz ANT +
            RxScanMode: true
        });

        // Temperature profile reused all temperature sensors

        //this.temperatureProfile = new TEMPProfile({ log: this.log.logging, onPage: configuration.onPage });

        //this.SDMProfile = new SDMProfile({ log: this.log.logging, onPage: configuration.onPage });

        //this.HRMProfile = new HRMProfile({ log: this.log.logging, onPage: configuration.onPage });

        //this.SPDCADProfile = new SPDCADProfile({ log: this.log.logging, onPage: configuration.onPage });

        this.profile = {}; // indexed by device type

        this.addProfile(new TEMPProfile({ log: this.log.logging, onPage: configuration.onPage }));
        this.addProfile(new SDMProfile({ log: this.log.logging, onPage: configuration.onPage }));
        this.addProfile(new HRMProfile({ log: this.log.logging, onPage: configuration.onPage }));
        this.addProfile(new SPDCADProfile({ log: this.log.logging, onPage: configuration.onPage }));

    }

    RxScanMode.prototype = Object.create(DeviceProfile.prototype);
    RxScanMode.constructor = RxScanMode;

    RxScanMode.prototype.addProfile = function (profile) {
        var deviceType;
        if (profile) {
            deviceType = profile.CHANNEL_ID.DEVICE_TYPE;
            if (deviceType === undefined || deviceType === null) {
                if (this.log.logging)
                    this.log.log('error', 'Could not retrive device type channel id on profile', profile);

            } else {
                this.profile[deviceType] = profile;
                if (this.log.logging)
                    this.log.log('info', 'Added profile for device type '+deviceType+' to RX SCAN mode channel', profile);
            }
        }
        else if (this.log.logging)
            this.log.log('error', 'Attempt to add an Undefined or Null profile is not allowed');
    }

    RxScanMode.prototype.broadCast = function (broadcast) {
        var currentProfile;
        if (!broadcast) {
            this.log.log('error', 'Undefined broadcast received');
            return;
        }

        if (!broadcast.channelId) {
            this.log.log('error', 'No channel id available for broadcast', broadcast);
            return;
        }

        // this.log.log('log',broadcast.channelId.toString(), broadcast.channelId);

        currentProfile = this.profile[broadcast.channelId.deviceType];

        if (currentProfile)
            currentProfile.broadCast(broadcast);
        else
            if (this.log.logging)
                this.log.log('warn', 'No profile registered for device type on RX SCAN channel', broadcast.data, 'from ' + broadcast.channelId.toString());

    };


    module.exports = RxScanMode;
    return module.exports;
});
