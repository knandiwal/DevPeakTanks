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

	

	return {
		
	};
	
})();