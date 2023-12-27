# unifi-activity-statistics

[![npm](https://img.shields.io/npm/v/unifi-activity-statistics.svg)](https://www.npmjs.com/package/unifi-activity-statistics)
[![npm](https://img.shields.io/npm/dt/unifi-activity-statistics.svg)](https://www.npmjs.com/package/unifi-activity-statistics)
[![License][mit-badge]][mit-url]

 unifi-activity-statistics is a Node.js module that allows you to listen for activity statistics and shows you the current RX and TX speeds from a specified port on your UnfiFi Dreammachine (UniFi is Ubiquiti Networks wifi controller software).  
   
 This package is heavily based on the awesome work of oznu's [unifi-events](https://www.npmjs.com/package/unifi-events). Please follow the link and buy him a coffee.

## Requirements

* Node.js v6 or later
* [UniFi-Controller](https://www.ubnt.com/download/unifi) v5

## Installation

`$ npm install unifi-activity-statistics`

## Example

```javascript
const UnifiActivityStatistics = require('unifi-activity-statistics');

let unifi = new UnifiActivityStatistics({
  host:             'unifi',    // The hostname or ip address of the unifi controller (default: 'unifi')
  port:             8443,       // Port of the unifi controller (default: 8443)
  username:         'admin',    // Username (default: 'admin').
  password:         'ubnt',     // Password (default: 'ubnt').
  uplink_interface: 'eth9',     // Port you want to listen to (default: eth9).
  site:             'default',  // The UniFi site to connect to (default: 'default').
  insecure:         true,       // Allow connections if SSL certificate check fails (default: false).
  unifios:          true        // For devices with UnifiOS turn this on
});

// Listen for event
unifi.on('uplink_activity', (data) => {
 console.log('RX: ' + (data.rx / 125000).toFixed(2) + ' TX: ' + (data.tx / 125000).toFixed(2));
});
```

## Events

unifi-activity-statistics uses [EventEmitter2](https://github.com/asyncly/EventEmitter2) and namespaced events. 

### namespace `ctrl`

These events indicate the status of the connection to the UniFi controller

* `ctrl.connect` - emitted when the connection to the controller is established
* `ctrl.disconnect` - emitted when the connection to the controller is lost
* `ctrl.error` - 
* `ctrl.reconnect` - 

## License

* MIT © 2023-2024 [flazer](https://github.com/flazer)
* MIT © 2017-2021 [oznu](https://github.com/oznu)
* MIT © 2018 [Sebastian Raff](https://github.com/hobbyquaker)    

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
