
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

tanks = this.agosp || {};

tanks.out = function(txt) {

	if( typeof tanks.DEBUG !== 'undefined' && tanks.DEBUG === false )
		return;

	if( this.console && console.log )
		console.log(txt);
	else if( !this.document && this.print )
		print( txt );
	else if( navigator.notification && navigator.notification.alert )
		navigator.notification.alert( txt, null, "Notification", "OK" )
	else if( this.alert )
		alert( txt );
};