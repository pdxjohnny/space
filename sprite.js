var sprite = function sprite ()
{
	this.image = new Image();
	this.show = false;
	this.stats = {
		keys_down: {},
		x: 0,
		y: 0
	};
	this.x = 0;
	this.y = 0;
	this.angle = 0;
}

sprite.prototype.key_down = function( event )
{
	this.stats.keys_down[ event.keyCode ] = true;
}

sprite.prototype.key_up = function( event )
{
	if ( event.keyCode in this.stats.keys_down )
	{
		delete this.stats.keys_down[ event.keyCode ];
	}
}

sprite.prototype.draw = function( ctx )
{
	if ( this.show && this.image.src.length != 0 &&
		typeof this.x !== 'undefined' &&
		typeof this.y !== 'undefined' )
	{
		if ( typeof this.angle !== 'undefined' )
		{
			ctx.drawRotatedImage( this.image, this.x,
				this.y, this.angle );
		}
		else
		{
			ctx.drawImage( this.image,
				this.x - this.image.width / 2,
				this.y - this.image.height / 2 );
		}
	}
}

sprite.prototype.update = function( modifier )
{
	if ( typeof this.stats.speed !== 'undefined' &&
		typeof this.stats.x !== 'undefined' &&
		typeof this.stats.y !== 'undefined' &&
		Object.keys(this.stats.keys_down).length > 0 &&
		this.angle_of() == 0 || this.angle_of() )
	{
		var to_angle = this.angle_of() - this.angle;
		if ( to_angle < 0 )
		{
			if ( to_angle <= -360 )
			{
				this.angle += to_angle;
			}
			if ( to_angle < -180 )
			{
				this.angle += this.stats.rate_of_turn / 10;
			}
			else
			{
				this.angle -= this.stats.rate_of_turn / 10;
			}
		}
		else if ( to_angle > 0 )
		{
			if ( to_angle >= 360 )
			{
				this.angle += to_angle;
			}
			if ( to_angle > 180 )
			{
				this.angle -= this.stats.rate_of_turn / 10;
			}
			else
			{
				this.angle += this.stats.rate_of_turn / 10;
			}
		}
		this.stats.x += Math.cos( this.angle * Math.PI / 180 )
			* this.stats.speed * modifier;
		this.stats.y += Math.sin( this.angle * Math.PI / 180 )
			* this.stats.speed * modifier;
		return true;
	}
	else
	{
		return false;
	}
}

sprite.prototype.angle_of = function()
{
	// Player holding up and right
	if ( ( 38 in this.stats.keys_down || 87 in this.stats.keys_down ) &&
		( 39 in this.stats.keys_down || 68 in this.stats.keys_down ) )
	{
		return 315;
	}
	// Player holding up and left
	else if ( ( 38 in this.stats.keys_down || 87 in this.stats.keys_down ) &&
		( 37 in this.stats.keys_down || 65 in this.stats.keys_down ) )
	{
		return 225;
	}
	// Player holding left and down
	else if ( ( 37 in this.stats.keys_down || 65 in this.stats.keys_down ) &&
		( 40 in this.stats.keys_down || 83 in this.stats.keys_down ) )
	{
		return 135;
	}
	// Player holding down and right
	else if ( ( 40 in this.stats.keys_down || 83 in this.stats.keys_down ) &&
		( 39 in this.stats.keys_down || 68 in this.stats.keys_down ) )
	{
		return 45;
	}
	// Player holding up
	else if ( 38 in this.stats.keys_down || 87 in this.stats.keys_down )
	{
		return 270;
	}
	// Player holding down
	else if ( 40 in this.stats.keys_down || 83 in this.stats.keys_down )
	{
		return 90;
	}
	// Player holding left
	else if ( 37 in this.stats.keys_down || 65 in this.stats.keys_down )
	{
		return 180;
	}
	// Player holding right
	else if ( 39 in this.stats.keys_down || 68 in this.stats.keys_down )
	{
		return 0;
	}
	else return false;
}
