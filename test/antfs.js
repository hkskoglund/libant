var antHost = new(require('../host'))({
  log: true,
  debugLevel : 0
});

var slavePort = 0,
    channel = 0,
    net = 0,
    deviceNumber = 0;

var devices;

function onError(error) {
  console.trace();
  console.error('error', error);
}

function onConnect(error)
{
  if (error) {
    console.log('onConnect',error);
    return;
  }

}

function onANTexited (err)
{
  if (!err)
    console.log(Date.now() + 'Exited from ANT',antHost.usb);
}

function onANTInited(error, notificationStartup) {

 if (error) {
   console.log('onantinited',error);
   return;
 }

 antHost.connectANTFS(channel,net,deviceNumber,onConnect);


  // TEST exit antHost.exit(onANTexited);

 }


devices = antHost.getDevices();
//console.log('devices',antHost.getDevices());

try {

  console.log('antfs device', devices[slavePort]);

  antHost.init(slavePort, onANTInited);
} catch (err) {
  onError(err);
}
