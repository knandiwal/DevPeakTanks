/*  DDRGAP JavaScript library, version 1.0
 *  (c) 2011 David de Rosier
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Revision: 1
 *  Date: 31.03.2011
 */

(function(){

	/**
	 * Object resposnible for values management when server connection is not available or not used.
	 * The sequencer works for following devices: compass, gps, accelerometer
	 *
	 * Sequence definition:
	 * -data -  an array of sequences, ech sequences has array of values and a speed
	 *          speed defines how often the values changing. If not provided or if zero,
	 *          the next value will be taken when the progrma will ask for it
	 * -loop - defines how to act when the data are finished. Possible options:
	 *          "none" - device switched of, onError listnere will be executed
	 *          "last" - last value will be provided at the end
	 *          "loop" - sequence will continue from first value
	 *          "swing" - it will revert from last values to first and back (default value)
	 * Exmaple:
	 * {
	 * 		data: [ {speed: 150, values: [1,2,3,4,5]},
	 *              {speed: 100, values: navigator.ddrgap.createRange({x: 0,y:0,z:0}, {x:3,y:0,z:0}, 100) } ],
	 *      loop: "swing"
	 * }
	 *
	 * @class
	 * @private
	 */
	var _Sequencer = (function(){
	
			var _data = { };
	
			/**
			 * Sequencer constructor
			 * @constructor
			 */
			var constr = function(type) {
					this.type = type;
					this.clearSequences();
					this.currentValue = null;
					this.currentSpeed = 0;
				};
				
			// sequencer prototype
			constr.prototype = {
			
					/**
					 * Moves to the next value in the sequence and sets the
					 * internal cursors next step ahead
					 */
					tick: function() {
							var d = _data[this.type];
							this.currentValue = d.data[d.currentArray].values[d.currentPosition];
							d.currentPosition += d.direction;
							this.currentSpeed = d.currentSpeed = d.data[d.currentArray].speed;
							
							if( d.currentPosition >= d.data[d.currentArray].values.length || d.currentPosition < 0 ) {
								d.currentArray += d.direction;
								if( d.currentArray < d.data.length && d.currentArray >= 0 ) {
									d.currentPosition = 0;
								} else {
									switch(d.loop) {
										case "none":
											this.currentValue = null;
											d.currentSpeed = 0;
											break;
										case "last":
											d.currentSpeed = 0;
											break;
										case "loop":
											d.currentArray = 0;
											d.currentPosition = 0;
											d.currentSpeed = d.data[d.currentArray].speed;
											d.direction = 1;
											break;
										case "swing":
										default:
											d.direction *= -1;
											d.currentPosition += d.direction;
											d.currentArray += d.direction;
									}
								}
							}
						},
						
					setSequences: function(s) {
							this.clearSequences();
							_data[this.type].data = s.data;
							_data[this.type].loop = s.loop || "swing";
							this.start();
						},
						
					addSequence: function(s) {
							_data[this.type].data.push( s.data );
						},
						
					clearSequences: function() {
							_data[this.type] = {
									data: [],
									currentArray: 0, 
									currentPosition: 0,
									currentSpeed: 0,
									direction: 1
								};
						},	

					stop: function() {
							var d = _data[this.type];
							d.timeoutId && clearTimeout(d.timeoutId);
						},
						
					start: function() {
							var d = _data[this.type];
							var that = this;
							
							d.data[d.currentArray].speed > 0 && (function(){
									_values[that.type] = that.currentValue;
									that.tick();
									if( d.currentSpeed > 0 )
										d.timeoutId = setTimeout( arguments.callee, d.currentSpeed );
								})();
							
						},
						
					// Re-creation of the constructor function 
					constructor: constr
				};
				
			return constr;
		})();
		
	
	/**
	 * Server communication object.
	 * @private
	 */	
	var _server = (function(){
			
			/**
			 * Method load socket.io library by adding a new <script> tag to the page
			 * @private
			 */
			var _loadSocketIO = function(address, port, onSuccess, onError) {
						var ioURL = String("http://").concat(address,":",port,ddrgap.SOCKET_IO_URL);
						var head = document.getElementsByTagName("head")[0];
						var script = document.createElement( "script" );
						script.setAttribute( "type", "text/javascript" );
						//script.setAttribute( "src", String(address).concat(port, ddrgap.SOCKET_IO_URL) );
						script.setAttribute( "src", ioURL );
						script.addEventListener( "load", function(){
								_log.debug( "socket.io successfully loaded" );
								_connect( address, port, onSuccess, onError );
							} );
						head.appendChild(script);			
						setTimeout( function(){
								_log.error( "Load of socket.io from '"+ioURL+"' failed" );
								if( typeof io !== "object" || typeof io.Socket !== "function" )
									onError && onError();
							}, Number(ddrgap.SERVER_CONNECTION_TIMEOUT) || 5000 );
				};
				
			/**
			 * Connects to the server with socket.io library
			 * @private
			 */
			//TODO handle onError situation
			var _connect = function(address, port, onSuccess, onError) {
					_socket = new io.Socket( address, { port: port || 80 } );
					_socket.connect();
					
					_socket.on('connect', function(){
							_log.debug( "Socket.io is connected to the server" );
							srv.connected = true; 
							srv.send( "register", { id: ddrgap.id } );
							onSuccess && onSuccess();
						});
						
					_socket.on('disconnect', function(){
							srv.connected = false;
							_log.debug( "Socket.io has been disconnected from teh server" ); 
						});
					
					_socket.on('message', _handleMessage);					
				};
				
			/** 
			 * Handles messages comming from the server
			 * @private
			 */
			var _handleMessage = function(msg) {
					if( typeof msg !== "object" || !msg.type || !msg.id ) {
						_log.debug( "Incomaptible message received: " + msg );
					}
					switch( msg.type ) {
						case "register":
							_clientId = msg.id;
							break;
						case ddrgap.devices.ACCELEROMETER:
							_values[msg.type] = msg.data;
							break;
						case "gps":
							_log.info( "GPS in not supported by this version of ddrgap" );
							break;
						case "camera":
							_log.info( "Camera in not supported by this version of ddrgap" );
							break;
						case "compass":
							_log.info( "Compass in not supported by this version of ddrgap" );
							break;
						default:
							_log.debug( "Message type has not been recognized: " + msg.type );
					}
				};
				
			var _socket = null;
			
			/** Client id created by the server */
			var _clientId = null;
	
			var srv = {
					connected: false,
					
					init: function(){
						},
						
					connect: function(address, port, onSuccess, onError) {
							if( typeof io !== "object" || typeof io.Socket !== "function" ) {
								_loadSocketIO( address, port, onSuccess, onError );
							} else {
								_connect( address, port, onSuccess, onError );
							}
						},
						
					// TODO
					disconnect: function() {
						},
						
					send: function(type, data) {
							data.clientType = "client";
							_socket.send( { type: type, data: data } );
						}						
				};
			
			return srv;
		})();


	/**
	 * Inner event mechanism, to not collide with the browser one.
	 * For ddrgap purposes is sufficient to limit it to single listener per event only
	 * @private
	 */ 
	var _events = (function(){
			var events = {};
			return {
					listen: function(event, listener) {
							events[event] = listener;
						},
					trigger: function(event, data) {
							events[event] && events[event](data);
						}
				};
		})();
		
		
	var _log = (function(){
			var _out = function(level, msg) {
				if( ddrgap.logLevel < level )
					return;
				var ev = document.createEvent( "Event" );
				ev.initEvent( "ddrgap-log", false, false );
				ev.message = msg;
				ev.level = level;
				document.dispatchEvent( ev );
			};
			
			return {
					debug: _out.bind(this, 4),
					info: _out.bind(this, 3),
					warn: _out.bind(this, 2),
					error: _out.bind(this, 1)
				};
		})();
		
		
	/**
	 * Current states of all devices
	 * @private
	 */
	var _values = {};


	/**
	 * DDRGAP configuration object
	 * @public
	 */
	var ddrgap = {
			server: null,
			port: 8124,
			id: null,
			
			log: null,
			
			sources: { PHONE: "phone", SERVER: "server", LOCAL: "local" },
			devices: { ACCELEROMETER: "accelerometer", GPS: "gps", COMPAS: "compas" },
			
			/** Local link to socket.io on the server */
			SOCKET_IO_URL: "/socket.io/socket.io.js",
			
			/** Time required to load soket.io and communicate to the server */
			SERVER_CONNECTION_TIMEOUT: 5000,
			
			/** Logging level; 0 - none, 1 - error, 2 - warning, 3 - info, 4 - debug */
			logLevel: 4,
			
			/**
			 * Helps to create ranges of values when work with sequences (without server connectivity)
			 * @param start {object} - start value
			 * @param end {object} - end value
			 * @param steps {number} - number of steps to take from beginning to end (default: 100)
			 * @return {array} values in the range
			 * @example createRange({x:0,y:1},{x:1,y:0},10);
			 */
			createRange: function(start, end, /*?*/times){
					var res = [];
					var times = times || 100; 
					var deltas = (function(){
							var d = {};
							for(var i in start) {
								if( start.hasOwnProperty(i) )
									d[i] = (end[i]-start[i]) / times;
							}
							return d;
						})();
					for( var i=0; i <= times; ++i ) {
						var o = {};
						for(var j in start) {
							if( start.hasOwnProperty(j) )
								o[j] = start[j] + deltas[j]*i;
						}
						res.push(o);
					}
					return res;
				},
			
			accelerometer: (function(){
					var _sequencer = new _Sequencer( "accelerometer" );
					var _source = "local";
					return {
							source: function(val){
									if( val ) {
										switch( val ) {
											case "local":
												_sequencer.start();
												_events.listen( ddrgap.devices.ACCELEROMETER, function(data){
														if( _sequencer.currentSpeed === 0 ) {
															_sequencer.tick();
															_values["accelerometer"] = _sequencer.currentValue;
														}
													} );
												break;
											case "device":
											case "server":
												_sequencer.stop();
												_server.connect( ddrgap.server, ddrgap.port );
												break;
											default: 
												val = _source;
										}
									}
									
									return val ? _source=val : _source;
								},
								
							setSequences: _sequencer.setSequences.bind(_sequencer)
						};
				})()
		};
		
		
	// Initialization of ddrgap object
	(function(){
		navigator.ddrgap = ddrgap;
		Object.seal && Object.seal( ddrgap ); 
		
		// read url params
		var params = (function(){
				var p = Array.prototype.filter.call( document.querySelectorAll("script[src]"), 
						function(script){ return script.src.indexOf("ddrgap.js") >=0 } );
				if( p.length === 0 ) 
					return null;
				
				var query = p[0].src.replace(/^.*\?/g,""),
					result = {},
					rule = /([^&=]+)=?([^&]*)/g,
					i = null;
				while( i = rule.exec(query) )
					result[ i[1] ] = i[2];
				
				return result;
			})();
		
		for( var i in params ) { if( params.hasOwnProperty(i) ) {
			switch(i) {
				case "server":		
				case "port":
					ddrgap[i] = params[i];
					break;
				case "source":
					ddrgap.accelerometer.source( params.source );
					break;
			}
		}}
	})();

	/**
	 * Function executed at deviceready or onload (when running outside device). It initilizes DDRGAP functionality
	 * when particular fuinctionalities are not available on the device and when PhoneGap does not provide 
	 * support to them
	 */
	var _init = function(){
	
		/**
		 * If accelerometer not available on the device, DDRGAP creates own object.
		 * Syntax equal to navigator.accleremoter og PhoneGap
		 * @see http://docs.phonegap.com/phonegap_accelerometer_accelerometer.md.html#Accelerometer
		 */
		navigator.accelerometer || ( navigator.accelerometer = (function(){
	
				/**
				 * Util function. Returns value for current device
				 * @private
				 */	
				var _val = function() {
						return _values[ ddrgap.devices.ACCELEROMETER ];
					};

				/**
				 * Util function. Checks current value and executes listener
				 * accoringly to the value (onSuccess or onError)
				 * @private
				 */	
				var _execute = function(onSuccess, onError){
						_events.trigger( ddrgap.devices.ACCELEROMETER );
						var val = _val();
						typeof val === "object" && val !== null 
							? (onSuccess && onSuccess(val)) : (onError && onError());
					};
		
				return {
					isEmulated: true,
					
					getCurrentAcceleration: function(onSuccess, onError){
							_execute(onSuccess, onError);
						},
					
					watchAcceleration: function(onSuccess, onError, options){
							var freq = options && options.frequency || 10000;
							return window.setInterval( function(){
									_execute(onSuccess, onError);
								}, freq);
						},
						
					clearWatch: function(id){
								id && clearInterval(id);
						}
				};
			})());
	

		
		// Triggers ddrgapready event
		(function(){
				var ev = document.createEvent( "Event" );
				ev.initEvent( "ddrgapready", false, true );
				document.dispatchEvent( ev );			
			})();
			
	};
	
	// Initialization of the DDRGAP objects
	(function(){
			if( navigator.userAgent.indexOf('Mobile') > 0 ) {
				document.addEventListener("deviceready", _init, false);
			} else {
				window.addEventListener("load", _init, false);
			}	
		})();

})();