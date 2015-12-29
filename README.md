# tempdeck

Monitor temperature over MQTT (currently you'll need to build your own client or use a tool), or just wait for alerts if/when temperature goes beyond tolerance.

## About

Tempdeck is a temperature monitoring application for Espruino on ESP 8266. Records temperature over MQTT. Sends alert messages - when temperature goes "out of tolerance" - via IFTTT Maker channel. 

There's much more that can be done here, for example local and remote control of temperature. Much of this I already have working as a prototype, but some of it is dependent on how the "Espruino for ESP 8266" port is finalised. The port itself is currently in development.

## Setup

Assumes running Espruino on ESP 8266. It will run on any ESP 8266 board, only one GPIO is required.
There is a Closure minified version included. 
Requires a DS18B20 temperature sensor.

This module could easilly be modified to run on Pico and original Espruino board.

You will need an IFTTT account (free), and to activate and configure the "Maker" channel to trigger the "that" of your choice. I find the SMS alerts to be convenient. For example, for an SMS message, you can use this script. 

```
Check your fermentation!! Current temp: {{Value1}} Target temp: {{Value2}} Time: {{OccurredAt}}
```
Both "Value1" (current temp) and "Value2" (target temp) parameters are provided by this module, just include them in your action. "OccurredAt" is an IFTTT timestamp, no need to worry about it.

If you want to subscribe to the MQTT topic for monitoring you'll need to know your ESP 8266 board's MAC address. ```getSerial();``` returns this. By default 'test.mosquitto.org' is the broker, and the topic will be 'tempdeck/esp8266/output-of-getSerial'. If using Espruino via the Chrome Web IDE, console will output your broker and topic information. e.g.

```
Connected..
MQTT Server: 'test.mosquitto.org', Topic: 'tempdeck/esp8266/18fe34da-fa4a' 
```

## Example   

```
var tempdeck = require("tempdeck").tempdeck;

// Below are the only required configuration options

// Configure
tempdeck.config.wifi = {
    ssid:	"MyWifiNetwork",
    pwd:	"myPassword"
};

tempdeck.config.ifttt = {
  key:		"nviy7SzmyiftttkeyufaEDSzsmy-anC98_wfbh",
  event:	"temp_tolerance"
};

// Start
tempdeck.init();

```



## Config Options

The ```tempdeck.config``` object literal has the following defaults. 

```
config: {
    wifi: {
      ssid:       "",
      password:   ""
    },
    pinIn:        "D0",
    target:       20,
    tolerance:    2,
    interval:     5,
    serial:  getSerial(), // This will return ESP 8266 MAC address
    mqtt: {
      server:     "test.mosquitto.org",
      topic :     "tempdeck/esp8266/"
    },
    ifttt: {
      key:        "",
      event:      ""
    }
  },
```

## To do

- A client for subscribing to the MQTT topic for the purpose of monitoring temperature
