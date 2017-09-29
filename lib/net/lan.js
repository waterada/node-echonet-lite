/* ------------------------------------------------------------------
* node-echonet-lite - lan
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-17
* ---------------------------------------------------------------- */
'use strict';
var mDgram = require('dgram');

/* ------------------------------------------------------------------
* Constructor: EchonetLiteNetLan()
* ---------------------------------------------------------------- */
var EchonetLiteNetLan = function() {
	this.initialized = false;
	this.ENL_PORT = 3610;
	this.ENL_MULTICAST_ADDRESSES = [
		"xxx.xxx.xxx.xxx",
		"xxx.xxx.xxx.xxx",
	];
	this.udp = null;
	this.dataCallback = function(){};
	this.sentCallback = function(){};
};

/* ------------------------------------------------------------------
* Method: init(callback)
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.init = function(params, callback) {
	this.dataCallback = function() {};
	if(this.udp) {
		this.udp.close(() => {
			this.udp = null;
			this._prepare(callback);
		});
	} else {
		this._prepare(callback);
	}
};

EchonetLiteNetLan.prototype._prepare = function(callback) {
	if(typeof(callback) !== 'function') {
		callback = function() {};
	}
	this.initialized = true;
	this.udp = mDgram.createSocket('udp4');

	this.udp.once("error", (err) => {
		callback(err);
	});

	this.udp.on('message', (buf, device_info) => {
		this.dataCallback(buf, device_info);
	});

	this.udp.bind(this.ENL_PORT, () => {
		//this.udp.addMembership(this.ENL_MULTICAST_ADDRESS);
		callback(null);
	});
};

/* ------------------------------------------------------------------
* Method: setDataCallback(callback)
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.setDataCallback = function(callback) {
	this.dataCallback = callback;
};

/* ------------------------------------------------------------------
* Method: setSentCallback(callback)
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.setSentCallback = function(callback) {
	this.sentCallback = callback;
};

/* ------------------------------------------------------------------
* Method: stopDiscovery()
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.stopDiscovery = function() {
	// Do nothing
};

/* ------------------------------------------------------------------
* Method: startDiscovery(buf[, callback])
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.startDiscovery = function(buf, callback) {
	if(!callback) {
		callback = function() {};
	}
	this.ENL_MULTICAST_ADDRESSES.forEach((address) => {
		this.udp.send(buf, 0, buf.length, this.ENL_PORT, address, (err, bytes) => {
			if(!err) {
				this.sentCallback(buf, {'address': address});
			}
			callback(err, null);
		});
	});
};

/* ------------------------------------------------------------------
* Method: send(address, buf[, callback])
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.send = function(address, buf, callback) {
	if(!callback) {
		callback = function(){};
	}
	this.udp.send(buf, 0, buf.length, this.ENL_PORT, address, (err, bytes) => {
		if(!err) {
			this.sentCallback(buf, {'address': address});
		}
		callback(err);
	});
};

/* ------------------------------------------------------------------
* Method: close([callback])
* ---------------------------------------------------------------- */
EchonetLiteNetLan.prototype.close = function(callback) {
	if(!callback) {
		callback = function(){};
	}
	this.initialized = false;
	this.dataCallback = function(){};
	this.sentCallback = function(){};
	if(this.udp) {
		this.udp.close(() => {
			this.udp = null;
			callback();
		});
	} else {
		this.udp = null;
		callback();
	}
};

module.exports = new EchonetLiteNetLan();
