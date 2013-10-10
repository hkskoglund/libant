/* global define: true, DataView: true */

define(function (require, exports, module) {
    'use strict';
    
    var  Logger = require('logger');
      
     function GenericPage(configuration,data,dataView) {
          if (configuration)
         this.log = new Logger(configuration.log);
        else
          this.log = new Logger();
         
         if (data)
          this.commonPage =  this.parse(data,dataView);
     }
    
    GenericPage.prototype.COMMON = {
        PAGE80 : 0x50,
        PAGE81 : 0x51 };
    
    GenericPage.prototype.NO_SERIAL_NUMBER = 0xFFFFFFFF;
    
//    GenericPage.prototype.COMMON_PAGES = [0x50,0x51];
//    
//     GenericPage.prototype.isCommon = function (number)
//     {
//         if (GenericPage.prototype.COMMON_PAGES.indexOf(number) !== -1)
//             return true;
//         else
//             return false;
//     };
    
     // Parsing of common pages
     GenericPage.prototype.parse = function (data,dataView)
     {
          var page;
         
         // Byte 0 
         this.number = data[0];
         
          // Byte 1 - reserved
        // 0xFF
        
        // Byte 2 - reserved
        // 0xFF
         
         switch (this.number)
         {
            
             case GenericPage.prototype.COMMON.PAGE80: // 80 Common data page - Manufactorer's identification
                
                 this.type = GenericPage.prototype.TYPE.BACKGROUND;
                 
                  // Byte 0
                this.number = data[0];
                
                // Byte 3  - HW revision - set by manufaturer
                this.HWRevision = data[3];
                
                // Byte 4 LSB - 5 MSB - little endian
                this.manufacturerID = dataView.getUint16(data.byteOffset+4,true);
                
                // Byte 6 LSB - 7 MSB - little endian
                this.modelNumber = dataView.getUint16(data.byteOffset+6,true);
      
                                          
                 break;
                 
             case GenericPage.prototype.COMMON.PAGE81: // 81 Common data page - Product information 
                               
                 this.type = GenericPage.prototype.TYPE.BACKGROUND;
                 
                // Byte 3 Software revision - set by manufacturer
                 this.SWRevision = data[3];
                
                // Byte 4 LSB - 7 MSB Serial Number - little endian
                 this.serialNumber = dataView.getUint32(data.byteOffset+4,true);
       
                                          
                 break;
                 
                 // TO DO : Page 82
                 
            default :
                                          
                 this.log.log('error','Unable to parse page number ',this.number+' 0x'+this.number.toString(16),data);
                                          
                 break;
                 
         }
       
      };
    
    
    GenericPage.prototype.toString = function ()
    {
        var msg;
        
        switch (this.number) {
            
            case GenericPage.prototype.COMMON.PAGE80 :
                    
                      msg = this.type + " P# " + this.number +" Manufacturer " + this.manufacturerID + " HW revision "+this.HWRevision+ " Model nr. "+this.modelNumber;
       
                    break;
                    
            case GenericPage.prototype.COMMON.PAGE81 : 
                    
                    msg = this.type + " P# " + this.number + " SW revision " + this.SWRevision;
       
                  if (this.serialNumber === GenericPage.prototype.NO_SERIAL_NUMBER)
                          msg += " No serial number";
                   else
                       msg += " Serial number " + this.serialNumber;
                    
                    break;
                    
            default :
                    this.log.log('error','Unable to construct string for page number',this.number);
                
                    break;
        }
                    
        return msg;
                    
    };
    
    GenericPage.prototype.TYPE = {
        MAIN : "Main",
        BACKGROUND : "Background"
    };
    
    module.exports = GenericPage;
    
    return module.exports;
});
