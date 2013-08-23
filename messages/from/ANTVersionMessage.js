﻿"use strict"
var ANTMessage = require('../ANTMessage.js');
  

function ANTVersionMessage() {

    //if (typeof data !== "undefined") {
    //    ANTMessage.call(this, data);
    //    this.parse();
    //} else
        ANTMessage.call(this);

    this.name = "ANT Version";
    this.id = ANTMessage.prototype.MESSAGE.ANT_VERSION;

   // console.log("Created ANTVersionMessage", this);
}

ANTVersionMessage.prototype = Object.create(ANTMessage.prototype);

ANTVersionMessage.prototype.constructor = ANTVersionMessage;

ANTVersionMessage.prototype.parse = function () {
   
      this.version = this.content.slice(0,-1).toString('utf8'); // Content is a 11 - bytes null terminated string - strip off the null

   // return this.message;

};

ANTVersionMessage.prototype.toString = function () {
    return this.name + " ID 0x" + this.id.toString(16) + " " + this.length + " " + this.version;
}

module.exports = ANTVersionMessage;