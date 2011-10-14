tanks = this.tanks || {};
tanks.ui = tanks.ui || {};

tanks.ui.game = (function(){
	var _tankNode = null;
	var $T = tanks;
	var g = {
			enemies: [],
			view: { x:0, y:0, w: 800, h: 480 },
			sounds: {},
			
			reset: function() {
				
				},
				
			updateView: function() {
			
				},
				
			scrollWindow: function(dx, dy) {
			},
			
			renderTank: function(accX, accY,id){
				if( !_tankNode ){
					_tankNode = divdocument.createElement("div");
					_tankNode.className = "tank";
					/*_tankNode.style.position = "absolute";
					_tankNode.style.top = "30px";
					_tankNode.style.left = "30px";
					_tankNode.style.backgroundImage = "img/tank.png";*/
					document.body.appendChild(_tankNode);
				}
				
			}
		};


	return g;

})();