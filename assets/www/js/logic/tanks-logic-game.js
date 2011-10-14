tanks = this.tanks || {};
tanks.logic = tanks.logic || {};

tanks.logic.game = (function(){

	
	var 
		_sin = [],
		_cos = []
		;
		
	(function(){
			var mp = Math.PI / 180;
			for( var i=0; i < 361; ++i) {
				_sin[i] = Math.sin(i*mp);
				_cos[i] = Math.cos(i*mp);
			}
		})();	

	// place the tank on the screen
	tanks.events.register( "onRenderTank", "RENDER_TANK" );

	
	
	// register Events
	tanks.events.listenOnce(document, tanks.events.APP_READY, function(){

		// render tank
		tanks.events.trigger( document, tanks.events.RENDER_TANK);
		
		navigator.accelerometer.watchAcceleration(function(e){
			console.log('X: ' + e.x + ' / Y: ' + e.y + " / Z: " + e.z);
		}, function(){}, {frequency: 250});
		
	});
	

	return {
		
	};
	
	
	
	
})();