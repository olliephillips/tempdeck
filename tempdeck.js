// Tempdeck. Remote temperature monitoring and alerts
// Written for Espruino running on ESP8266
// Copyright 2016, MIT License

var tempdeck = {
  // Configuration defaults
  config: {
    wifi: {
      ssid:       "",
      password:   ""
    },
    pinIn:        "D0",
    target:       20,
    tolerance:    2,
    interval:     5,
    serial:  getSerial(),
    mqtt: {
      server:     "test.mosquitto.org",
      topic :     "tempdeck/espruino/"
    },
    ifttt: {
      key:        "",
      event:      ""
    }
  },
  // Start up
  init: function(){ 
    // Setup OneWire
    pinMode(tempdeck.config.pinIn, 'input');
    tempdeck.ow = new OneWire(tempdeck.config.pinIn);
    tempdeck.probe = require("DS18B20").connect(tempdeck.ow);
    
    // Setup Wifi & connect
    tempdeck.wifi = require("Wifi");
    //tempdeck.wifi.stopAP();
    tempdeck.wifi.connect(tempdeck.config.wifi.ssid,{password: tempdeck.config.wifi.pwd},
      function(params) {
        console.log("Connected..");
        // Setup MQTT
        tempdeck.mqttSetup();
        tempdeck.monitor();
      }
    );
  }, 
  // Manage MQTT connection
  mqttSetup: function() {
    tempdeck.mqtt = null;
    tempdeck.mqtt = require("https://github.com/olliephillips/tinyMQTT/blob/master/tinyMQTT.min.js")
      .create(tempdeck.config.mqtt.server);
    tempdeck.mqtt.connect();
    tempdeck.mqtt.on("connected", function(){
      tempdeck.send = true;
      console.log("MQTT Server: '"+ tempdeck.config.mqtt.server +"', Topic: '" + 
                  tempdeck.config.mqtt.topic + tempdeck.config.serial + "'");
      tempdeck.mqtt.on("disconnected", function(){
        tempdeck.send = false;
        console.log("Disconnected");
        tempdeck.mqttSetup();
      });
    });
  },
  // Routine to record and log temperature
  monitor: function() {
    tempdeck.monitorCount = 0;
    tempdeck.onAlert = false;
    setInterval(function(){
      tempdeck.curTemp = tempdeck.probe.getTemp().toFixed(2);
      if(tempdeck.monitorCount > 0) { // Ignore first read
        console.log("Current temp is " + tempdeck.curTemp);
        // Record over MQTT
        if(tempdeck.send === true) {
          tempdeck.message = {
            targetTemp: tempdeck.config.target,
            currentTemp: tempdeck.curTemp
          };
          tempdeck.mqtt.publish("tempdeck/espruino/" + tempdeck.config.serial, JSON.stringify(tempdeck.message));
        }  
        // Within tolerance?
        tempdeck.variance = tempdeck.config.target - tempdeck.curTemp;
        if(tempdeck.variance < 0 ) {
          tempdeck.variance = tempdeck.variance * -1;
        }
        if(tempdeck.variance > tempdeck.config.tolerance) {
            // Check if alert already been sent
            if(tempdeck.onAlert == false) {
              // Fire alert
              tempdeck.alert();
            }
        }
      }
      tempdeck.monitorCount++;
    }, tempdeck.config.interval * 1000);  
  }, 
  // IFTTT alert notification
  alert: function(){
    tempdeck.alertTarget =  "http://maker.ifttt.com/trigger/" + tempdeck.config.ifttt.event + "/with/key/"+ tempdeck.config.ifttt.key;
    tempdeck.alertData = "?value1=" + tempdeck.curTemp + "&value2=" + tempdeck.config.target;
    require("http").get(tempdeck.alertTarget + tempdeck.alertData, function(res) {
    res.on('close', function() {
      tempdeck.onAlert = true;
      console.log("Alert sent");
    });
  });
  } 
};
exports.tempdeck = tempdeck;