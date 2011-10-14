
mixin = function(dst, src) {
	if( !src || typeof src !== 'object' )
		return dst;
	
	for( var i in src ) {
		src.hasOwnProperty(i) && ( dst[i] = src[i] );
	}
		
	return dst;
};

Function.prototype.bind || (Function.prototype.bind = function(ctx){
	var fn = this, 
		args = Array.prototype.slice.call(arguments,1);
		
	return function() {
		return fn.apply( ctx, args.concat(Array.prototype.slice.call(arguments)) );
	};
});

tanks = this.tanks || {};

tanks.out = function(txt) {

	if( typeof tanks.DEBUG !== 'undefined' && tanks.DEBUG === false )
		return;
	var global = (function(){return this;})();
	if( global.console && console.log )
		console.log(txt);
	else if( !global.document && global.print )
		print( txt );
	else if( navigator.notification && navigator.notification.alert )
		navigator.notification.alert( txt, null, "Notification", "OK" )
	else if( global.alert )
		alert( txt );
};