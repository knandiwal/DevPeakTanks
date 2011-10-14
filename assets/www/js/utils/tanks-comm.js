tanks = this.tanks || {};

tanks.socket = (function(){
	
	var socket = null
		;
	
	var _handleMessage = function(msg) {
			if( !msg || !msg.type ) {
				tanks.out( "Invalid message received" );
				return;
			}
			var m = msg;
			switch( msg.type ) {
				case 'join':
					tanks.events.trigger( document, tanks.events.PLAYER_JOINED, m );
					break;
				case 'move':
					tanks.events.trigger( document, tanks.events.TANK_MOVED, m );
					break;
				case 'die':
					tanks.events.trigger( document, tanks.events.TANK_DESTROYED, m );
					break;
				case 'fire':
					tanks.events.trigger( document, tanks.events.TANK_SHOT, m );
					break;
				case 'die':
					tanks.events.trigger( document, tanks.events.TANK_DESTROYED, m );
					break;
				case 'quit':
					tanks.events.trigger( document, tanks.events.USER_QUIT, m );
					break;					
				
				
				default: tanks.out( "Invalid message received: " + msg.type );
			}
		};
		
	tanks.events.register( "socketconnected", "SOCKET_CONNECTED" );
	tanks.events.register( "socketdisconnected", "SOCKET_DISCONNECTED" );
		
	var obj = {
		
		connect: function(address, port) {
				if( typeof io !== "object" || !io.Socket ) {
					throw new Error( "socket.io not available" );
				}
				socket = io.connect('http://192.168.101.173:8124');
				//socket.connect();
				
				socket.on('connect', function(){ tanks.events.trigger( document, tanks.events.SOCKET_CONNECTED ); });
				socket.on('disconnect', function(){ tanks.events.trigger( document, tanks.events.SOCKET_DISCONNECTED ); } );
				
				socket.on('message', _handleMessage);
			},
			
		send: function(msg) {
				if( !socket ) {
					throw new Error( "Not possible to send a message - connection not established" );
				}
				socket.emit( "message", msg );
			}
	};
	
	return obj;
	
})();

