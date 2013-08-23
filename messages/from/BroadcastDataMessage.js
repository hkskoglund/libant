﻿"use strict"
var ANTMessage = require('../ANTMessage.js');

function BroadcastDataMessage() {
    ANTMessage.call(this);

    this.name = "Broadcast Data";
    this.id = ANTMessage.prototype.MESSAGE.BROADCAST_DATA;
}

BroadcastDataMessage.prototype = Object.create(ANTMessage.prototype);

BroadcastDataMessage.prototype.constructor = BroadcastDataMessage;

// Spec. p. 91
BroadcastDataMessage.prototype.parse = function (content) {
    if (typeof content !== "undefined" && Buffer.isBuffer(content))
        this.setContent(content);

    this.channel = this.content[0];
    this.data = this.content.slice(1, 9); // Date 0 .. 7
    this.extended = (content.length > 9) ? true : false;
    if (this.extended)
        this.flag = content[9];


};

// Parsing of the "flagged extended data message format"
//BroadcastDataMessage.prototype.parse_extended_message = function (channel, data) {
//    var msgLength = data[1], msgFlag,
//        self = this,
//        relativeIndex = 9,
//        previous_RX_Timestamp;


//    if (msgLength <= relativeIndex) {
//        self.emit(Host.prototype.EVENT.LOG_MESSAGE, " No extended message info. available");
//        return;
//    }

//    //console.log("Extended message flag + {channelID+RSSI+RX_Timestamp} + CRC", data.slice(4+8), "message length:",msgLength);

//    msgFlag = data[12];

//    // Check for channel ID
//    // p.37 spec: relative order of extended messages; channel ID, RSSI, timestamp (based on 32kHz clock, rolls over each 2 seconds)

//    if (msgFlag & Host.prototype.LIB_CONFIG.ENABLE_CHANNEL_ID) {
//        this.parseChannelID(data, relativeIndex);
//        relativeIndex = relativeIndex + 8; // Channel ID = Device Number 2-bytes + Device type 1 byte + Transmission Type 1 byte
//    }

//    if (msgFlag & Host.prototype.LIB_CONFIG.ENABLE_RSSI) {
//        this.parse_extended_RSSI(channel, data, relativeIndex);
//        relativeIndex = relativeIndex + 4;
//    }

//    if (msgFlag & Host.prototype.LIB_CONFIG.ENABLE_RX_TIMESTAMP) {
//        // console.log(data,relativeIndex);
//        if (typeof this.channelConfiguration[channel].RX_Timestamp)
//            previous_RX_Timestamp = this.channelConfiguration[channel].RX_Timestamp;
//        // Some times RangeError is generated during SIGINT
//        try {
//            //if (relativeIndex <= data.length -2) {
//            this.channelConfiguration[channel].RX_Timestamp = data.readUInt16LE(relativeIndex);
//            if (typeof previous_RX_Timestamp !== "undefined") {
//                this.channelConfiguration[channel].RX_Timestamp_Difference = this.channelConfiguration[channel].RX_Timestamp - previous_RX_Timestamp;
//                if (this.channelConfiguration[channel].RX_Timestamp_Difference < 0) // Roll over
//                    this.channelConfiguration[channel].RX_Timestamp_Difference += 0xFFFF;
//            }
//            // } else
//            //     console.log(Date.now(), "Attempt to UInt16LE read RX_Timestamp buffer data length :", data.length, "at index", relativeIndex,data);
//        } catch (err) {
//            console.log(Date.now(), "Parsing extended packet info RX_Timestamp Data length : ", data.length, "relativeIndex", relativeIndex, data, err);
//            //throw err;
//        }


//        //console.log("Timestamp", this.channelConfiguration[channel].RX_Timestamp);
//    }
//};


//BroadcastDataMessage.prototype.parse_extended_RSSI = function (channel, data, startIndex) {
//    //console.log("CHANNEL NR: ",channel,"startIndex",startIndex,"data:",data);
//    // http://www.thisisant.com/forum/viewthread/3841 -> not supported on nRF24AP2....
//    // Create new RSSI object if not available
//    var self = this;
//    if (typeof this.channelConfiguration[channel].RSSI === "undefined")
//        this.channelConfiguration[channel].RSSI = {};

//    this.channelConfiguration[channel].RSSI.measurementType = data[startIndex];

//    if (this.channelConfiguration[channel].RSSI.measurementType === Host.prototype.RSSI.MEASUREMENT_TYPE.DBM) {
//        this.channelConfiguration[channel].RSSI.value = data[startIndex + 1];
//        this.channelConfiguration[channel].RSSI.thresholdConfigurationValue = data[startIndex + 2];
//    }
//    //else
//    //    this.emit(Host.prototype.EVENT.LOG_MESSAGE, " Cannot decode RSSI, unknown measurement type " + this.channelConfiguration[channel].RSSI.measurementType);

//    //console.log(this.channelConfiguration[channel].RSSI);
//    this.channelConfiguration[channel].RSSI.toString = function () {
//        var str;

//        str = "Measurement type 0x" + self.channelConfiguration[channel].RSSI.measurementType.toString(16);

//        if (self.channelConfiguration[channel].RSSI.value)
//            str += " RSSI value " + self.channelConfiguration[channel].RSSI.value;

//        if (self.channelConfiguration[channel].RSSI.thresholdConfigurationValue)
//            str += " Threshold conf. value " + self.channelConfiguration[channel].RSSI.thresholdConfigurationValue;

//        return str;
//    };

//    return this.channelConfiguration[channel].RSSI;

//};

//BroadcastDataMessage.prototype.parseChannelID = function (data, relIndex) {


//    var channelID =
//     {
//         channelNumber: data[3]
//     },
//        self = this, relativeIndex = 0;

//    if (typeof relIndex !== "undefined") // Extended messages parsing
//        relativeIndex = relIndex;

//    if (7 + relativeIndex < data.length) {
//        channelID.deviceNumber = data.readUInt16LE(4 + relativeIndex);
//        channelID.deviceTypeID = data[6 + relativeIndex];
//        channelID.transmissionType = data[7 + relativeIndex];

//        channelID.toProperty = "CHANNEL_ID_" + channelID.channelNumber + "_" + channelID.deviceNumber + "_" + channelID.deviceTypeID + "_" + channelID.transmissionType;

//        //console.log("parsed channelID ",channelID.toProperty,"relative Index",relativeIndex);

//        channelID.toString = function () {
//            return "Channel # " + channelID.channelNumber + " device # " + channelID.deviceNumber + " device type " + channelID.deviceTypeID + " transmission type " + channelID.transmissionType + " " + self.parseTransmissionType(channelID.transmissionType);
//        };


//        this.channelConfiguration[channelID.channelNumber].channelID = channelID;
//        this.channelConfiguration[channelID.channelNumber].hasUpdatedChannelID = true;

//        //this.emit(Host.prototype.EVENT.LOG_MESSAGE, channelID.toString());

//    } else {
//        console.log(Date.now(), "Attempt to read beyond data buffer length data length", data.length, "relativeIndex", relativeIndex, data);
//    }

//    //console.log(channelID.toString());
//    return channelID;
//};

//BroadcastDataMessage.prototype.RSSI =
//    {
//        MEASUREMENT_TYPE: {
//            DBM: 0x20
//        }
//    };


BroadcastDataMessage.prototype.toString = function () {
    return this.name + " ID 0x" + this.id.toString(16)+" C# "+this.channel+" "+ "ext. "+this.extended+" Flag "+this.flag;
}

module.exports = BroadcastDataMessage
