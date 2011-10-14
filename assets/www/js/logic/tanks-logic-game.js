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
	
	// register Events
	tanks.events.listenOnce(document, tanks.events.APP_READY, function(){
		
		navigator.accelerometer.watchAcceleration(function(e){
			// place the tank on the screen
			tanks.ui.game.renderTank(e.x, e.y);
		}, function(){}, {frequency: 250});
		
	});
	

	return {
		
	};
	
	
	
	
})();