tanks = this.tanks || {};
tanks.dom = tanks.dom = (function(){
	
	var $D = document;
	
	return {
		byId: function(id) {
				return $D.getElementById(id);
			}
	};

})();

