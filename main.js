var game = function game ( canvas_div_id )
{
	this.set_canvas( canvas_div_id );
	this.full_screen();
	this.on_screen = {};
	this.running = false;
	this.then = Date.now();
	this.player = false;
	this.background_color = '#40406A';
	return this;
}

game.prototype.set_canvas = function( canvas_div_id )
{
	this.canvas_div = document.getElementById( canvas_div_id );
	if ( this.canvas_div )
	{
		this.ctx = this.canvas_div.getContext("2d");
	}
}

game.prototype.full_screen = function()
{
	if ( this.canvas_div )
	{
		this.canvas_div.style.position = 'absolute';
		this.canvas_div.style.top = '0px';
		this.canvas_div.style.left = '0px';
		this.canvas_div.width = window.innerWidth;
		this.canvas_div.height = window.innerHeight;
		this.create_stars();
	}
}

game.prototype.reset_size = function()
{
	this.canvas_div.style.position = 'relative';
	this.canvas_div.width = this.canvas_div.parentElement.width;
	this.canvas_div.height = this.canvas_div.parentElement.height;
	this.create_stars();
}

game.prototype.update = function( modifier )
{
	this.blink_stars( modifier );
	for ( var i in this.on_screen )
	{
		if ( typeof this.on_screen[i].update === 'function' )
		{
			this.on_screen[i].update( modifier );
		}
		space.adjust_to_player( space.on_screen[i] )
	}
	this.move_stars( modifier );
}

game.prototype.draw = function()
{
	this.draw_background();
	this.draw_stars();
	for ( var i in this.on_screen )
	{
		if ( typeof this.on_screen[i].draw === 'function' &&
			this.on_screen[i].x > 0 &&
			this.on_screen[i].x < this.canvas_div.width &&
			this.on_screen[i].y > 0 &&
			this.on_screen[i].y < this.canvas_div.height )
		{
			this.on_screen[i].draw( this.ctx );
		}
	}
}

game.prototype.start = function()
{
	this.running = true;
	this.main();
}

game.prototype.stop = function()
{
	this.running = false;
	if ( this.player )
	{
		this.player.stop_movement();
	}
}

game.prototype.main = function() {
	if ( this.running )
	{
		var now = Date.now();
		var delta = now - this.then;
		var modifier = delta / 1000;
		this.update( modifier );
		this.draw();
		this.then = Date.now();
		requestAnimationFrame( this.main.bind(this) );
	}
}

game.prototype.adjust_to_player = function( object )
{
	if ( this.player )
	{
		object.x = (object.stats.x - this.player.stats.x) + this.player.x;
		object.y = (object.stats.y - this.player.stats.y) + this.player.y;
	}
}

game.prototype.control = function ( name ) {
	if ( this.player )
	{
		this.player.stop_movement();
	}
	this.player = this.on_screen[ name ];
	this.player.start_movement( this.canvas_div );
}


game.prototype.draw_background = function()
{
	this.ctx.beginPath();
	this.ctx.fillStyle = this.background_color;
	this.ctx.rect( 0, 0, this.canvas_div.width, this.canvas_div.height);
	this.ctx.fill();
}

game.prototype.create_stars = function()
{
	// draw a random starfield on the canvas
	this.stars = [];
	for( var n = 0; n < this.canvas_div.width / 10; ++n )
	{
		this.stars.push({
			x: parseInt( Math.random() * this.canvas_div.width ),
			y: parseInt( Math.random() * this.canvas_div.height ),
			blink_rate: Math.random() * 3,
			max_radius: Math.random() * 5,
			radius: Math.random() * 3,
			increasing: Math.round( Math.random() )
		});
	}
	this.ctx.fillStyle = "white";
	this.ctx.fill();
}

game.prototype.draw_stars = function()
{
	this.ctx.beginPath();
	for( var star in this.stars )
	{
		this.ctx.arc( this.stars[star].x, this.stars[star].y,
			this.stars[star].radius, 0, Math.PI * 2, false );
		this.ctx.closePath();
	}
	this.ctx.fillStyle = "white";
	this.ctx.fill();
}

game.prototype.move_stars = function( modifier )
{
	if ( this.player &&
		typeof this.player.stats.speed !== 'undefined' &&
		typeof this.player.stats.x !== 'undefined' &&
		typeof this.player.stats.y !== 'undefined' &&
		Object.keys(this.player.stats.keys_down).length > 0 )
	{
		for( var star in this.stars )
		{
			this.stars[star].x -= Math.cos( this.player.angle * Math.PI / 180 )
				* this.player.stats.speed * modifier;
			this.stars[star].y -= Math.sin( this.player.angle * Math.PI / 180 )
				* this.player.stats.speed * modifier;
			if ( this.stars[star].x < 0 )
			{
				this.stars[star].x += this.canvas_div.width - Math.random() * 30;
			}
			if ( this.stars[star].x > this.canvas_div.width )
			{
				this.stars[star].x -= this.canvas_div.width - Math.random() * 30;
			}
			if ( this.stars[star].y < 0 )
			{
				this.stars[star].y += this.canvas_div.height - Math.random() * 30;
			}
			if ( this.stars[star].y > this.canvas_div.height )
			{
				this.stars[star].y -= this.canvas_div.height - Math.random() * 30;
			}
		}
	}
}

game.prototype.blink_stars = function( modifier )
{
	for( var star in this.stars )
	{
		if ( this.stars[star].radius >= this.stars[star].max_radius )
		{
			this.stars[star].increasing = false;
		}
		if ( this.stars[star].increasing && this.stars[star].radius < this.stars[star].max_radius )
		{
			this.stars[star].radius += this.stars[star].blink_rate * modifier;
		}
		else if ( this.stars[star].radius - (this.stars[star].blink_rate * modifier) < 0 )
		{
			this.stars[star].increasing = true;
		}
		else
		{
			this.stars[star].radius -= this.stars[star].blink_rate * modifier;
		}
	}
}

game.prototype.add_player = function( name )
{
	this.on_screen[ name ] = new player( name );
}

requestAnimationFrame = (window.requestAnimationFrame && window.requestAnimationFrame.bind(window)) || 
	(window.webkitRequestAnimationFrame && window.webkitRequestAnimationFrame.bind(window)) || 
	(window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window)) || 
	(window.mozRequestAnimationFrame && window.mozRequestAnimationFrame.bind(window)) || 
	function( callback ){ window.setTimeout(callback, 1000 / 60); };
