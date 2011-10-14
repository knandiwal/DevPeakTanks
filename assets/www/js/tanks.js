tanks = this.tanks || {};

(function(){
	
	var $T = tanks;
	
	mixin( $T, {
	
			VERSION: '1.0',
			DEBUG: true,
			
			ID: +new Date()
			
		} );
		

	var _init = function() {
			$T.events.trigger( document, $T.events.APP_READY );
		};

	tanks.events.register( "applicationready", "APP_READY" );
		
	$T.DEVICE = navigator.userAgent.indexOf('Mobile') >= 0;
	if( $T.DEVICE ) {
		document.addEventListener("deviceready", _init, false);
	} else {
		window.addEventListener("load", _init, false);
	}
	
})();
