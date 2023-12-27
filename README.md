# unifi-activity-statistics

[![npm](https://img.shields.io/npm/v/unifi-activity-statistics.svg)](https://www.npmjs.com/package/unifi-activity-statistics)
[![npm](https://img.shields.io/npm/dt/unifi-activity-statistics.svg)](https://www.npmjs.com/package/unifi-activity-statistics)
[![License][mit-badge]][mit-url]

 unifi-activity-statistics is a Node.js module that allows you to listen for activity statistics and shows you the current RX and TX speeds from a specified port on your UnfiFi Dreammachine (UniFi is Ubiquiti Networks wifi controller software).
 This package is based on the work of oznu's [unifi-events](https://www.npmjs.com/package/unifi-events). Please follow the link to buy him a coffee.

## Requirements

* Node.js v6 or later
* [UniFi-Controller](https://www.ubnt.com/download/unifi) v5

## Installation

`$ npm install unifi-activity-statistics`

## Example

```javascript
const Unifi = require('unifi-events')

const unifi = new Unifi({
  host: 'unifi',                        // The hostname or ip address of the unifi controller (default: 'unifi')
  port: 8443,                           // Port of the unifi controller (default: 8443)
  username: 'admin',                    // Username (default: 'admin').
  password: 'ubnt',                     // Password (default: 'ubnt').
  site: 'default',                      // The UniFi site to connect to (default: 'default').
  insecure: true,                       // Allow connections if SSL certificate check fails (default: false).
  unifios: false                        // For devices with UnifiOS turn this on
});

// Listen for any event
unifi.on('**', function (data) {
  console.log(this.event, data);
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
