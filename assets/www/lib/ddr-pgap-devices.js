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
	 *          "none" - zeros will be provided as result
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
	var _sequencer = (function(){
	
			var _data = { };
	
			/**
			 * Sequencer constructor
			 * @constructor
			 */
			var constr = function(type) {
					this.type = type;
					this.clearSequences();
				};
				
			// sequencer prototype
			constr.prototype = {
			
					/**
					 * Moves to the next value in the sequence and sets the
					 * internal cursors next step ahead
					 */
					tick: function() {
						},
						
					setSequences: function(s) {
							this.clearSequences();
							_data[type].data = s.data;
							_data[type].loop = s.loop;
							this.tick();
						},
						
					addSequence: function(s) {
							_data[type].data.push( s.data );
						},
						
					clearSequences: function() {
							_data[type] = {
									data: [],
									currentArray: 0, 
									currentPosition: 0,
									direction: 1
								};
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
	var _server = {
		};


	/**
	 * DDRGAP configuration object
	 * @public
	 */
	var ddrgap = {
			server: null,
			port: 80,
			
			log: null,
			
			order: { PHONE: "phone", SERVER: "server", LOCAL: "local" },
			device: { ACCELEROMETER: "acc", GPS: "gps", COMPAS: "compas" },
			
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
					for( var i=0; i < times; ++i ) {
						var o = {};
						for(var j in start) {
							if( start.hasOwnProperty(j) )
								o[j] = start[j] + deltas[j]*i;
						}
						res.push(o);
					}
					return res;
				},
			
			accelerometer: {
					order: [ "phone", "server", "local" ]
				}
		};
		
	navigator.ddrgap = ddrgap;

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
		
				var _lastWatchId = 0,
					_watches = []
					;
		
				return {
					getCurrentAcceleration: function(){
						},
					
					watchAcceleration: function(onSuccess, onError, options){
							var freq = options && options.frequency || 10000;
							var data = {x: 0, y:0, z:0, frequency: freq };
							return window.setInterval( function(){
									onSuccess( data );
								}, freq);
						},
						
					clearWatch: function(id){
							if( _watches[id] ) {
								stopInterval(id);
								_watches[id] = null;
								delete _watches[id];
							}
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