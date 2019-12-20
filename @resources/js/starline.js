(function(){
	var $ = (function(elm){
		return document.querySelector(elm);
	}),
	Stars = function(){
		var num = (Math.min(window.innerWidth, window.innerHeight) / Math.max(window.innerWidth, window.innerHeight)) * 750, //Math.abs(window.innerWidth - window.innerHeight),
			makeStar = function(){
				return {
					radius: Math.random() * (1 - .5) + .5,
					pos: {
						x: Math.random() * c.width,
						y: Math.random() * c.height
					},
					moveTo: {
						x: Math.random() * c.width,
						y: Math.random() * c.height
					},
					bigger: ~~(Math.random() * 2),
					speed: Math.random() * (c.width / c.height / 40)
				}
			},
			stars = [],
			draw = function(star){
				ctx.fillStyle = "#fff";
				ctx.beginPath();
				ctx.arc(star.pos.x, star.pos.y, star.radius, 0, Math.PI * 2);
				ctx.fill();
				if(star.bigger){
					star.radius += .01;
					if(star.radius >= 0.04) star.bigger = false;
				}else{
					star.radius -= .01;
					if(star.radius <= .3) star.bigger = true;
				}
				if(
					star.moveTo.x >= star.pos.x - 5 &&
					star.moveTo.x <= star.pos.x + 5
				){
					star.moveTo.x = Math.random() * c.width;
				}
				else if(star.moveTo.x < star.pos.x) star.pos.x -= star.speed;
				else if(star.moveTo.x > star.pos.x) star.pos.x += star.speed;
				if(
					star.moveTo.y >= star.pos.y - 5 &&
					star.moveTo.y <= star.pos.y + 5
				){
					star.moveTo.y = Math.random() * c.height;
				}
				else if(star.moveTo.y < star.pos.y) star.pos.y -= star.speed;
				else if(star.moveTo.y > star.pos.y) star.pos.y += star.speed;
				
				for(var i = 0; i < stars.length; i++){
					if(
						star != stars[i] &&
						Math.sqrt(
							(star.pos.x - stars[i].pos.x) * (star.pos.x - stars[i].pos.x) + 
							(star.pos.y - stars[i].pos.y) * (star.pos.y - stars[i].pos.y)
						) < 50
					){
						ctx.beginPath();
						ctx.moveTo(star.pos.x, star.pos.y);
						ctx.lineTo(stars[i].pos.x, stars[i].pos.y);
						ctx.closePath();
						ctx.strokeStyle = "#fff";
						ctx.lineWidth = .025;
						ctx.stroke();
					}
				}
			}
		return {
			init: function(){
				for(var i = 0; i < 250; i++){
					stars.push(new makeStar());
				}
			},
			move: function(){
				setInterval(function(){
					ctx.clearRect(0, 0, c.width, c.height);
					background();
					for(var i = 0; i < stars.length; i++){
						draw(stars[i]);
					}
				}, 1);
			}
		}
	}
	c = $("#sky"),
	background = function(){
		var grdnt = ctx.createLinearGradient(0, 0, 0, c.height);
		grdnt.addColorStop(0, "#000");
		grdnt.addColorStop(.5, "#135288");
		grdnt.addColorStop(1, "#0C5663");
		ctx.fillStyle = grdnt;

	},
	sky = new Stars();
	
	c.width = window.innerWidth;
	c.height = window.innerHeight;

	var ctx = c.getContext("2d");
	
	sky.init();
	background();
	sky.move();
	window.addEventListener("resize", function(){
		c.width = window.innerWidth;
		c.height = window.innerHeight;
	}, true);
}());