this.tanks = this.tanks || {};

tanks.events = (function(){
	
	var _events = [];
	
	var _utils = {
			exist: function(type){
					return _events.indexOf(type) >= 0;
				}
		};
	
	return {
		
			register: function(type, variable /* ? */) {
				if( _utils.exist(type) === false ) {
					_events.push( type )
					if( variable )
						this[variable] = type;
					return true;
				}
				return false;
			},
		
			listen: function(element, type, listener) {
				if( _utils.exist(type) === false )
					return false;
				element.addEventListener(type, listener, false);
				return true; 
			},
			
			listenOnce: function(element, type, listener) {
				var that = this;
				this.listen( element, type, function(evt) {
						listener(evt);
						that.remove(element, type, arguments.callee);
					});
			},
			
			remove: function(element, type, listener) {
				element.removeEventListener( type, listener, false );
			},
			
			trigger: function(element, type, data) {
				var ev = document.createEvent( "Event" );
				ev.initEvent( type, true, true );
				data && mixin( ev, data );
				element.dispatchEvent( ev );
			}
		};
	
})();
