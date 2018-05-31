
// ==================== VARIABLES ====================

// Constants
const START_SPEED = 1;
const START_WAVE = 1;
const MAX_SPEED = 4;
const PLAYER_SPEED = 1.5;
const PLAYER_SIZE = 20;
const PLAYER_HEALTH = 5;
const PLAYER_SHOOTDELAY = 15
const BULLET_SPEED = 6;
const BULLET_SIZE = 4;
const EXHAUST_SIZE = 3;
const POWERUP_SPEED = 1;
const POWERUP_SIZE = 18;
const POWERUP_LENGTH = 1000;
const DEBRIS_SPEED = 2;
const DEBRIS_SIZE = 4;
const NUM_DEBRIS = 4;
const NUM_DEBRIS_DESTROY = 25;
const NUM_DUSTS = 100;
const UI_HEART_SIZE = 30;
const UI_POWERUP_SIZE = 0.025;
const UI_POWERUP_ADJUST = 0.0125;

// Textures
var tex_player1 = new Image(); tex_player1.src = "resources/player1.png";
var tex_player2 = new Image(); tex_player2.src = "resources/player2.png";
var tex_alien1 = new Image(); tex_alien1.src = "resources/alien1.png";
var tex_alien2 = new Image(); tex_alien2.src = "resources/alien2.png";
var tex_alien3 = new Image(); tex_alien3.src = "resources/alien3.png";
var tex_alien4 = new Image(); tex_alien4.src = "resources/alien4.png";
var tex_alien5 = new Image(); tex_alien5.src = "resources/alien5.png";
var tex_heart1 = new Image(); tex_heart1.src = "resources/heart1.png";
var tex_heart2 = new Image(); tex_heart2.src = "resources/heart2.png";
var tex_powerup1 = new Image(); tex_powerup1.src = "resources/powerup1.png";
var tex_powerup2 = new Image(); tex_powerup2.src = "resources/powerup2.png";
var tex_powerup3 = new Image(); tex_powerup3.src = "resources/powerup3.png";
var tex_powerup4 = new Image(); tex_powerup4.src = "resources/powerup4.png";
var tex_powerup5 = new Image(); tex_powerup5.src = "resources/powerup5.png";

// Variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var keysDown = [];
var inGame = false;
var inMenu = true;
var progressToGame = 0;
var speed = START_SPEED;
var curWave = 0;
var startWave = false;
var powerupSprites = [tex_powerup1, tex_powerup2, tex_powerup3, tex_powerup4, tex_powerup5];
var score = 0;
var displayWave = 0;

// Waves
var waves = [
[1,1],
[1,1,0,0],
[2,2,2,2,2],
[1,0,0,2,2],
[1,1,0,0,2,4,4],
[3,3,3,3,3,3],
[1,1,0,0,0,0,2,4,4,3,3]
];

// Objects
var player1;
var player2;
var aliens = [];
var bullets = [];
var dusts = [];
var exhausts = [];
var debris = [];
var powerups = [];

// Alien Patterns (0 up, 1 down, 2 left, 3 right, 4 shoot, 5 delay)
var pattern_1 = [
2,2,2,2,2,2,2,2,2,2,2,2,2,5,4,5,1,1,1,1
];
var pattern_2 = [
2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,5,5,5,4,5,4,5,4,5,5,5
];
var pattern_3 = [
1,1,1,1,2,1,1,1,1,3
];
var pattern_4 = [
1,1,1,1,1,1,1,1,4,4,0,0,0,0,0,2,0,2,0,2,0,2,0,2,0,2,2,4,2,4,2,2,1,2,1,2,1,2,1,2,1,2
];
var pattern_5 = [
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,2,2,2,2,2,0,0,0,0,0,2,2,2,2,2,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,2,2,2,2,2
];

// Alien Types - 0 normal / 1 longranged / 2 kamakazi / 3 small fighter / 4 heavybomber
var alienSprites = [tex_alien1, tex_alien2, tex_alien3, tex_alien4, tex_alien5];
var alienHealths = [4, 3, 2, 1, 10];
var alienSpeeds = [1.5, 1, 2, 3, 0.5];
var alienSizes = [25, 40, 20, 20, 35];
var alienBulletSpeeds = [2, 4, 0, 2.5, 1.5];
var alienValues = [2000, 2500, 1500, 2000, 3000];
var alienPatterns = [pattern_1, pattern_2, pattern_3, pattern_4, pattern_5];

// ==================== CLASSES ====================

// --- Player Class ---
function Player (x, y, _sprite)
{
	this.pos = { x, y };
	this.sprite = _sprite;

	if (this.sprite == tex_player1)
	{ this.upKey = 87; this.downKey = 83; this.leftKey = 65; this.rightKey = 68; this.shootKey = 87; this.playerNum = 1; }
	else
	{ this.upKey = 38; this.downKey = 40; this.leftKey = 37; this.rightKey = 39; this.shootKey = 38; this.playerNum = 2; }

	this.health = PLAYER_HEALTH;
	this.alive = true;
	this.hasControl = false;
	this.flyingOnScreen = true;
	this.gunLoaded = 0;

	this.speedBoost = 0;
	this.bulletBoost = 0;
	this.immortalBoost = 0;

	this.Update = function ()
	{
		if (this.alive)
		{
			// Exhaust
			exhausts.push(new Exhaust(this.pos.x, this.pos.y + 10));

			// If flying into game
			if (this.flyingOnScreen)
			{
				this.pos.y -= 2;
				this.immortalBoost = 50;
				if (this.pos.y <= canvas.height - 100)
				{
					this.hasControl = true;
					this.flyingOnScreen = false;
				}
			}

			// If in game
			else
			{
				// Collisions from bullets
				for (var i = 0; i < bullets.length; i++)
				{
					if (bullets[i].speed < 0)
					{
						if (Math.abs(this.pos.x - bullets[i].pos.x) < PLAYER_SIZE / 1.5 &&
							Math.abs(this.pos.y - bullets[i].pos.y) < PLAYER_SIZE / 1.5)
						{
							if (this.immortalBoost == 0)
								this.health--;
							else
								for (var j = 0; j < NUM_DEBRIS; j++) debris.push(new Debris(this.pos.x, this.pos.y));

							bullets[i].Destroy();
						}
					}
				}

				// Collisions from aliens
				for (var i = 0; i < aliens.length; i++)
				{
					if (Math.abs(this.pos.x - aliens[i].pos.x) < (PLAYER_SIZE + aliens[i].size) / 2 &&
						Math.abs(this.pos.y - aliens[i].pos.y) < (PLAYER_SIZE + aliens[i].size) / 2)
					{
						if (this.immortalBoost == 0)
							this.health = 0;
						else
							for (var j = 0; j < NUM_DEBRIS; j++) debris.push(new Debris(this.x, this.y));

						aliens[i].Destroy();
					}
				}

				// Collisions from players
				if (Math.abs(player1.pos.x - player2.pos.x) < PLAYER_SIZE &&
					Math.abs(player1.pos.y - player2.pos.y) < PLAYER_SIZE)
				{
					if (player1.immortalBoost == 0) player1.health = 0;
					if (player2.immortalBoost == 0) player2.health = 0;
				}

				// Collisions from powerups
				for (var i = 0; i < powerups.length; i++)
				{
					if (Math.abs(this.pos.x - powerups[i].pos.x) < (PLAYER_SIZE + POWERUP_SIZE) / 2 &&
						Math.abs(this.pos.y - powerups[i].pos.y) < (PLAYER_SIZE + POWERUP_SIZE) / 2)
					{
						switch (powerups[i].type)
						{
							case 0:
								if (this.health < PLAYER_HEALTH)
								{
									this.health++;
									score += 2500;
								}
								else
									score += 5000;
								break;

							case 1:
								if (!player1.alive)
								{
									player1.alive = true;
									player1.hasControl = true;
									player1.health = 5;
									player1.flyingOnScreen = true;
									player2.health--;
								}
								else if (!player2.alive)
								{
									player2.alive = true;
									player2.hasControl = true;
									player2.health = 5;
									player2.flyingOnScreen = true;
									player1.health--;
								}
								else
								{
									score += 10000;
								}
								break;

							case 2:
								this.speedBoost = POWERUP_LENGTH;
								score += 2000;
								break;

							case 3:
								this.bulletBoost = POWERUP_LENGTH;
								score += 2000;
								break;

							case 4:
								this.immortalBoost = POWERUP_LENGTH;
								score += 2000;
								break;
						}

						powerups[i].Destroy();
					}
				}

				// Bondaries
				if (this.pos.y < PLAYER_SIZE + 40)                 this.pos.y = PLAYER_SIZE + 40;
				if (this.pos.y > canvas.height - PLAYER_SIZE - 50) this.pos.y = canvas.height - PLAYER_SIZE - 50;
				if (this.pos.x < PLAYER_SIZE)                      this.pos.x = PLAYER_SIZE;
				if (this.pos.x > canvas.width - PLAYER_SIZE)       this.pos.x = canvas.width - PLAYER_SIZE;

				// Reload bullets
				if (this.gunLoaded > 0) this.gunLoaded--;
				else                    this.gunLoaded = 0;

				// Remove powerups
				if (this.speedBoost > 0) this.speedBoost--;
				else                     this.speedBoost = 0;

				if (this.bulletBoost > 0) this.bulletBoost--;
				else                      this.bulletBoost = 0;

				if (this.immortalBoost > 0) this.immortalBoost -= 2;
				else                        this.immortaltBoost = 0;

				// Checks health
				if (this.health <= 0) this.Death();

				// Control
				if (this.hasControl)
				{

					// Apply powerup effects
					if (this.speedBoost > 0) this.actualSpeedBoost = 1.75;
					else                     this.actualSpeedBoost = 1;

					if (this.bulletBoost > 0) this.actualBulletBoost = 0.5;
					else                      this.actualBulletBoost = 1;

					// Moving
					if (keysDown[this.upKey])        this.pos.y -= PLAYER_SPEED * this.actualSpeedBoost;
					else if (keysDown[this.downKey]) this.pos.y += PLAYER_SPEED * this.actualSpeedBoost;
					if (keysDown[this.leftKey])      this.pos.x -= PLAYER_SPEED * this.actualSpeedBoost;
					if (keysDown[this.rightKey])     this.pos.x += PLAYER_SPEED * this.actualSpeedBoost;

					// Shooting
					if (keysDown[this.shootKey] && this.gunLoaded == 0)
					{
						bullets.push(new Bullet(this.pos.x, this.pos.y, BULLET_SPEED));
						this.gunLoaded = PLAYER_SHOOTDELAY * this.actualBulletBoost;
					}
				}
			}
		}
	}

	// Draws to frame
	this.Draw = function ()
	{
		if (this.alive)
		{
			if (this.immortalBoost > 0) {
				ctx.beginPath();
				ctx.arc(this.pos.x, this.pos.y, PLAYER_SIZE, 0, 2 * Math.PI, false);
				ctx.fillStyle = "rgb(0,150,255)"; ctx.fill();
				ctx.lineWidth = 3; ctx.strokeStyle = "rgb(0,255,255)"; ctx.stroke();
			}

			ctx.drawImage(
				this.sprite,
				this.pos.x - PLAYER_SIZE/2,
				this.pos.y - PLAYER_SIZE/2,
				PLAYER_SIZE,
				PLAYER_SIZE);
		}
	}

	// Destroys the player
	this.Death = function ()
	{
		for (var i = 0; i < NUM_DEBRIS_DESTROY; i++)
			debris.push(new Debris(this.pos.x, this.pos.y));

		this.alive = false;
		this.hasControl = false;
		this.speedBoost = 0;
		this.bulletBoost = 0;
		this.immortaltBoost = 0;

		// Puts it out of the way
		this.pos.x = (Math.random() * canvas.width/2) + canvas.width/4;
		this.pos.y = canvas.height;
	}
}

// --- Alien Class ---
function Alien (x, y, _type)
{
	this.pos = { x, y };
	this.type = _type;
	if (this.type == 1)
	{
		this.pos.x = -((Math.random() * 250) + 20);
		this.pos.y = (Math.random() * 100) + 100;

		if (Math.random() > 0.5)
			this.pos.x = canvas.width - this.pos.x;
	}

	this.sprite = alienSprites[this.type];
	this.health = alienHealths[this.type];
	this.speed = alienSpeeds[this.type];
	this.size = alienSizes[this.type];
	this.bulletSpeed = alienBulletSpeeds[this.type];
	this.pattern = alienPatterns[this.type];

	this.stepInPattern = Math.floor(Math.random() * this.pattern.length * 10);
	this.dir = 1;
	this.firedShot = false;

	this.Update = function ()
	{
		// Collisions from bullets
		for (var i = 0; i < bullets.length; i++)
		{
			if (bullets[i].speed > 0)
			{
				if (Math.abs(this.pos.x - bullets[i].pos.x) < this.size / 1.5 &&
					Math.abs(this.pos.y - bullets[i].pos.y) < this.size / 1.5)
				{
					for (var j = 0; j < NUM_DEBRIS; j++)
						debris.push(new Debris(this.pos.x, this.pos.y));

					this.health--;
					bullets[i].Destroy();
				}
			}
		}

		// Checks health
		if (this.health <= 0) this.Destroy();

		// Loop back to top if past bottom
		if (this.pos.y > canvas.height - 30) {
			this.pos.x = Math.random() * (canvas.width - 100) + 50;
			this.pos.y = 20;
		}

		// Repeativly increments through the pattern (changes every 10 frames)
		this.stepInPattern++;
		if (this.stepInPattern > this.pattern.length * 10)
			this.stepInPattern = 0;

		// Only fire one bullet per instruction
		if (this.stepInPattern % 10 == 0)
			this.firedShot = false;

		// Performs instruction
		switch (this.pattern[Math.floor(this.stepInPattern/10)])
		{
			case 0:
				this.pos.y -= this.speed;
				break;

			case 1:
				this.pos.y += this.speed;
				break;

			case 2:
				this.pos.x -= this.speed * this.dir;
				break;

			case 3:
				this.pos.x += this.speed * this.dir;
				break;

			case 4:
				if (!this.firedShot)
					bullets.push(new Bullet(this.pos.x, this.pos.y, -this.bulletSpeed));
				this.firedShot = true;
				break;

			case 5:
				break;
		}

		// Change direction if hitting edge
		if (this.pos.x < this.size)
			this.dir = -1;
		if (this.pos.x > canvas.width - this.size)
			this.dir = 1;
	}

	// Draws to frame
	this.Draw = function ()
	{
		ctx.drawImage(
			this.sprite,
			this.pos.x - this.size/2,
			this.pos.y - this.size/2,
			this.size,
			this.size);
	}

	// Removes itself from list
	this.Destroy = function ()
	{
		for (var i = 0; i < NUM_DEBRIS_DESTROY; i++)
			debris.push(new Debris(this.pos.x, this.pos.y));

		if (Math.floor(Math.random() * 8) == 0)
			powerups.push(new Powerup(this.pos.x, this.pos.y));

		score += alienValues[this.type];

		this.index = aliens.indexOf(this);
		aliens.splice(this.index, 1);
	}
}

// --- Bullet Class ---
function Bullet (x, y, _speed)
{
	this.pos = { x, y };
	this.speed = _speed;

	this.Update = function ()
	{
		// Moves bullet
		this.pos.y -= this.speed;

		// Destroy itself if outside boundaries
		if (this.pos.y < 40 || this.pos.y > canvas.height)
			this.Destroy();
	}

	// Draw to frame
	this.Draw = function ()
	{
		ctx.fillRect(
			this.pos.x - BULLET_SIZE/2,
			this.pos.y - BULLET_SIZE/2,
			BULLET_SIZE, BULLET_SIZE);
	}

	// Removes itself from list
	this.Destroy = function ()
	{
		this.index = bullets.indexOf(this);
		bullets.splice(this.index, 1);
	}
}

// --- Dust Class ---
function Dust ()
{
	this.pos =
	{
		x: Math.floor(Math.random() * canvas.width),
		y: Math.floor(Math.random() * canvas.height)
	};

	this.Update = function ()
	{
		// Moves dust
		this.pos.y += speed;
		if (this.pos.y > canvas.height + 10) {
			this.pos.x = Math.floor(Math.random() * canvas.width);
			this.pos.y = -10;
		}
	}

	// Draw to frame
	this.Draw = function ()
	{
		ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
	}
}

// --- Exhaust Class ---
function Exhaust (x, y)
{
	this.pos = { x: x + Math.floor(Math.random() * 8) - 4, y };
	this.lifetime = Math.floor(Math.random() * 50);

	this.Update = function ()
	{
		// Moves exhaust
		this.pos.y += speed;
		this.pos.x += (Math.random() * 2) - 1;

		// Destroys it
		this.lifetime--;
		if (this.lifetime <= 0)
		{
			this.index = exhausts.indexOf(this);
			exhausts.splice(this.index, 1);
		}
	}

	// Draws to frame
	this.Draw = function ()
	{
		ctx.fillRect(
			this.pos.x - EXHAUST_SIZE / 2,
			this.pos.y - EXHAUST_SIZE / 2,
			EXHAUST_SIZE, EXHAUST_SIZE);
	}
}

// --- Debris Class ---
function Debris (x, y)
{
	this.pos = { x, y };
	this.vel =
	{
		x: Math.random() * DEBRIS_SPEED - DEBRIS_SPEED/2,
		y: Math.random() * DEBRIS_SPEED - DEBRIS_SPEED/2
	};
	this.lifetime = Math.floor(Math.random() * 100);

	this.Update = function ()
	{
		// Moves debris
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;

		// Destroys it
		this.lifetime--;
		if (this.lifetime <= 0)
		{
			this.index = debris.indexOf(this);
			debris.splice(this.index, 1);
		}
	}

	// Draws to frame
	this.Draw = function ()
	{
		ctx.fillRect(
			this.pos.x - DEBRIS_SIZE / 2,
			this.pos.y - DEBRIS_SIZE / 2,
			DEBRIS_SIZE, DEBRIS_SIZE);
	}
}

// --- Powerup Class ---
function Powerup (x, y)
{
	this.pos = { x, y };
	this.type = Math.floor(Math.random() * powerupSprites.length);
	this.sprite = powerupSprites[this.type];

	this.Update = function ()
	{
		// Moves powerup
		this.pos.y += POWERUP_SPEED;

		// Destroys it
		if (this.pos.y > canvas.height)
			this.Destroy();
	}

	// Draws to frame
	this.Draw = function ()
	{
		ctx.drawImage(
			this.sprite,
			this.pos.x - POWERUP_SIZE / 2,
			this.pos.y - POWERUP_SIZE / 2,
			POWERUP_SIZE, POWERUP_SIZE);
	}

	// Removes itself from list
	this.Destroy = function ()
	{
		this.index = powerups.indexOf(this);
		powerups.splice(this.index, 1);
	}
}


// ==================== FUNCTIONS ====================

// --- Sets Up Menu and Game ---
function SetupGame ()
{
	// Displays menu
	progressToGame = 0;

	// Spawns initial dust
	for (var i = 0; i < NUM_DUSTS; i++)
		dusts.push(new Dust());
}


// --- Starts Game ---
function StartGame ()
{
	// Spawns players
	player1 = new Player(150, canvas.height + 50, tex_player1);
	player2 = new Player(canvas.width - 150, canvas.height + 50, tex_player2);

	// Sets up
	curWave = START_WAVE - 1;
	progressToGame = 0;
	score = 0;
}

// --- Main Loop ---
function Update ()
{
	// Updates everything universally needed
	for (var i = 0; i < dusts.length; i++)    dusts[i].Update();
	for (var i = 0; i < exhausts.length; i++) exhausts[i].Update();
	for (var i = 0; i < powerups.length; i++) powerups[i].Update();
	for (var i = 0; i < bullets.length; i++)  bullets[i].Update();
	for (var i = 0; i < debris.length; i++)   debris[i].Update();

	if (inGame)
	{
		// Intro
		if (inMenu && progressToGame >= 200)
			inMenu = false;

		if (speed <= MAX_SPEED)    speed += 0.02;
		if (progressToGame <= 200) progressToGame += 3;
		if (!inMenu)               progressToGame = 200;

		// Updates Players
		player1.Update();
		player2.Update();

		// Updates Aliens
		for (var i = 0; i < aliens.length; i++)
			aliens[i].Update();
	}
	else
	{
		// Outro
		if (speed >= START_SPEED) speed -= 0.01;
		if (progressToGame > 0)  progressToGame -= 3;
		else                     progressToGame = 0;
	}

	// Updates wave
	if (inGame) UpdateWave();

	// End game
	if ((inGame && !player1.alive && !player2.alive) || keysDown[27])
		EndGame();

	// Draws frame
	Draw();
}

// --- Controls Waves ---
function UpdateWave ()
{
	// Starts new wave
	if (startWave)
	{
		startWave = false;
		displayWave = 200;
		if (curWave <= waves.length)
		{
			for (var i = 0; i < waves[curWave-1].length; i++)
				aliens.push(new Alien(
					Math.random() * (canvas.width - 100) + 50,
					(Math.random() * 100) - 100,
					waves[curWave-1][i]));
		}
		// Reached the end of preset waves, use random waves
		else
		{
			for (var i = 0; i < curWave; i++)
				aliens.push(new Alien(
					(Math.random() * canvas.width + alienSizes[0] * 4) - alienSizes[0] * 2,
					(Math.random() * 100) - 100,
					Math.floor(Math.random() * alienSprites.length)));
		}
	}

	// Start next wave
	if (aliens.length == 0 && !inMenu)
	{
		startWave = true;
		curWave++;

		// Revives dead players
		if (!player1.alive)
		{ player1.flyingOnScreen = true; player1.alive = true; player1.hasControl = true; player1.health = 0; }
		if (!player2.alive)
		{ player2.flyingOnScreen = true; player2.alive = true; player2.hasControl = true; player2.health = 0; }

		// Adds health to both players
		if (player1.health < PLAYER_HEALTH) player1.health++;
		if (player2.health < PLAYER_HEALTH) player2.health++;

		// Spawns powerups and adds points
		if (curWave != 1)
		{
			powerups.push(new Powerup(Math.random() * canvas.width, -Math.random() * 100));
			powerups.push(new Powerup(Math.random() * canvas.width, -Math.random() * 100));
			score += 2000;
		}
	}
}

// --- Draws Everything Needed ---
function Draw ()
{
	// Background
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Dusts
	ctx.fillStyle = "white";
	for (var i = 0; i < dusts.length; i++) dusts[i].Draw();

	// Debris
	for (var i = 0; i < debris.length; i++)
	{
		if (Math.random() > 0.5) ctx.fillStyle = "orange";
		else                     ctx.fillStyle = "red";
		debris[i].Draw();
	}

	if (inGame) DrawGame();
	if (inMenu) DrawMenu();
	if (inGame) DrawUI();

	// Borders
	ctx.fillStyle = "grey";
	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, 5);
	ctx.fill(); ctx.beginPath();
	ctx.rect(0, canvas.height, canvas.width, -5);
	ctx.fill(); ctx.beginPath();
	ctx.rect(0, 0, 5, canvas.height);
	ctx.fill(); ctx.beginPath();
	ctx.rect(canvas.width, 0, -5, canvas.height);
	ctx.fill();
}

// --- Draws Game ---
function DrawGame ()
{
	// Exhausts
	ctx.fillStyle = "lightgrey";
	for (var i = 0; i < exhausts.length; i++) exhausts[i].Draw();

	// Powerups
	for (var i = 0; i < powerups.length; i++) powerups[i].Draw();

	// Bullets
	ctx.fillStyle = "white";
	for (var i = 0; i < bullets.length; i++) bullets[i].Draw();

	// Players
	player1.Draw();
	player2.Draw();

	// Aliens
	for (var i = 0; i < aliens.length; i++) aliens[i].Draw();
}

// --- Draw Menu ---
function DrawMenu ()
{
	// Title text
	ctx.fillStyle = "#6b005d";
	ctx.font = "50px Arial";
	ctx.fillText("SPACE IN THE", canvas.width/2 - 165, 97 - progressToGame);
	ctx.fillStyle = "purple";
	ctx.font = "50px Arial";
	ctx.fillText("SPACE IN THE", canvas.width/2 - 165, 100 - progressToGame);

	// Shaking
	var addedX = (Math.random() * 3) - 1.5;
	var addedY = (Math.random() * 3) - 1.5;

	ctx.fillStyle = "darkred";
	ctx.font = "100px Arial";
	ctx.fillText("FACE", (canvas.width/2 - 130) + addedX, (190 - progressToGame) + addedY);
	ctx.fillStyle = "red";
	ctx.font = "100px Arial";
	ctx.fillText("FACE", (canvas.width/2 - 130) + addedX, ((193 - progressToGame) + addedY));

	// Latest Score
	if (score != 0)
	{
		ctx.fillStyle = "white";
		ctx.font = "15px Arial";
		ctx.fillText("Last Round: " + score, canvas.width/2 - 59, (35 - progressToGame));
	}

	// Line
	ctx.beginPath();
	ctx.rect((canvas.width/2 - 130) + addedX, (200 - progressToGame) + addedY, 265, 10);
	ctx.fillStyle = "darkred";
	ctx.fill();
	ctx.beginPath();
	ctx.rect((canvas.width/2 - 130) + addedX, (205 - progressToGame) + addedY, 265, 10);
	ctx.fillStyle = "red";
	ctx.fill();

	// Subtitles
	ctx.fillStyle = "white";
	ctx.font = "15px Arial";
	ctx.fillText("Press any key!", canvas.width/2 - 50, canvas.height - 100 + progressToGame);
	ctx.fillText("WASD - Player 1", canvas.width/2 - 55, canvas.height - 70 + progressToGame);
	ctx.fillText("ARROWS - Player 2", canvas.width/2 - 65, canvas.height - 50 + progressToGame);
	ctx.font = "10px Arial";
	ctx.fillText("Ted Johnson - 02/18", canvas.width/2 - 45, canvas.height - 10 + progressToGame);
}


// --- Draws UI ---
function DrawUI ()
{
	// Top Panel
	ctx.beginPath();
	ctx.rect(0, progressToGame/5 - 5, canvas.width, 5);
	ctx.fillStyle = "#303030";
	ctx.fill();
	ctx.beginPath();
	ctx.rect(0, -5, canvas.width, progressToGame/5);
	ctx.fillStyle = "grey";
	ctx.fill();

	// Bottom Panel
	ctx.beginPath();
	ctx.rect(0, (canvas.height + 150) - (progressToGame), canvas.width, 5)
	ctx.fillStyle = "#303030";
	ctx.fill();
	ctx.beginPath();
	ctx.rect(0, (canvas.height + 155) - (progressToGame), canvas.width, 50)
	ctx.fillStyle = "grey";
	ctx.fill();

	// Wave Number
	ctx.fillStyle = "white";
	ctx.font = "20px Arial";
	if (curWave != 0)
		ctx.fillText("Wave " + curWave, 10, progressToGame/8);
	else
		ctx.fillText("Ready...", 10, progressToGame/8);

	// Display new wave text
	ctx.fillStyle = "white";
	ctx.font = "50px ar destine";
	if (displayWave > 0)
	{
		displayWave--;
		ctx.fillText("Wave " + curWave, (displayWave*4)-200, canvas.height/2);
	}
	else
		displayWave = 0;

	// Score
	ctx.fillStyle = "white";
	ctx.font = "20px Arial";
	ctx.fillText("" + score, canvas.width - 100, progressToGame/8);

	//Hearts
	for (var i = 0; i < player1.health; i++)
	{
		ctx.drawImage(
			tex_heart1,
			i * (UI_HEART_SIZE + 10) + 10,
			canvas.height + 160 - (progressToGame),
			UI_HEART_SIZE,
			UI_HEART_SIZE);
	}

	for (var i = 0; i < player2.health; i++){
		ctx.drawImage(
			tex_heart2,
			canvas.width - (i * (UI_HEART_SIZE + 10) + 40),
			canvas.height + 160 - (progressToGame),
			UI_HEART_SIZE,
			UI_HEART_SIZE);
	}

	ctx.lineWidth = 2;
	ctx.strokeStyle = "grey";
	ctx.fillStyle = "#606060"; 

	// Powerup display circles 1
	ctx.beginPath();
	ctx.arc(23, canvas.height - 67 + (200 - progressToGame), UI_POWERUP_SIZE * POWERUP_LENGTH / 2, 0, 2 * Math.PI, false);
	ctx.fill(); ctx.stroke(); ctx.beginPath();
	ctx.arc(53, canvas.height - 67 + (200 - progressToGame), UI_POWERUP_SIZE * POWERUP_LENGTH / 2, 0, 2 * Math.PI, false);
	ctx.fill(); ctx.stroke(); ctx.beginPath();
	ctx.arc(83, canvas.height - 67 + (200 - progressToGame), UI_POWERUP_SIZE * POWERUP_LENGTH / 2, 0, 2 * Math.PI, false);
	ctx.fill(); ctx.stroke();

	// Powerup display circles 2
	ctx.beginPath();
	ctx.arc(canvas.width - 22, canvas.height - 67 + (200 - progressToGame), UI_POWERUP_SIZE * POWERUP_LENGTH / 2, 0, 2 * Math.PI, false);
	ctx.fill(); ctx.stroke(); ctx.beginPath();
	ctx.arc(canvas.width - 52, canvas.height - 67 + (200 - progressToGame), UI_POWERUP_SIZE * POWERUP_LENGTH / 2, 0, 2 * Math.PI, false);
	ctx.fill(); ctx.stroke(); ctx.beginPath();
	ctx.arc(canvas.width - 82, canvas.height - 67 + (200 - progressToGame), UI_POWERUP_SIZE * POWERUP_LENGTH / 2, 0, 2 * Math.PI, false);
	ctx.fill(); ctx.stroke();

	// Powerup display 1
	if (player1.speedBoost > 0)
		ctx.drawImage(
			tex_powerup3,
			23 - (player1.speedBoost * UI_POWERUP_ADJUST),
			(canvas.height - 67)  - (player1.speedBoost * UI_POWERUP_ADJUST),
			UI_POWERUP_SIZE * player1.speedBoost,
			UI_POWERUP_SIZE * player1.speedBoost);

	if (player1.bulletBoost > 0)
		ctx.drawImage(
			tex_powerup4,
			53  - (player1.bulletBoost * UI_POWERUP_ADJUST),
			(canvas.height - 67)  - (player1.bulletBoost * UI_POWERUP_ADJUST),
			UI_POWERUP_SIZE * player1.bulletBoost,
			UI_POWERUP_SIZE * player1.bulletBoost);

	if (player1.immortalBoost > 0)
		ctx.drawImage(
			tex_powerup5,
			83  - (player1.immortalBoost * UI_POWERUP_ADJUST),
			(canvas.height - 67)  - (player1.immortalBoost * UI_POWERUP_ADJUST),
			UI_POWERUP_SIZE * player1.immortalBoost,
			UI_POWERUP_SIZE * player1.immortalBoost);

	// Powerup display 2
	if (player2.speedBoost > 0)
		ctx.drawImage(
			tex_powerup3,
			canvas.width - (22 + (player2.speedBoost * UI_POWERUP_ADJUST)),
			(canvas.height - 67)  - (player2.speedBoost * UI_POWERUP_ADJUST),
			UI_POWERUP_SIZE * player2.speedBoost,
			UI_POWERUP_SIZE * player2.speedBoost);

	if (player2.bulletBoost > 0)
		ctx.drawImage(
			tex_powerup4,
			canvas.width - (52  + (player2.bulletBoost * UI_POWERUP_ADJUST)),
			(canvas.height - 67)  - (player2.bulletBoost * UI_POWERUP_ADJUST),
			UI_POWERUP_SIZE * player2.bulletBoost,
			UI_POWERUP_SIZE * player2.bulletBoost);

	if (player2.immortalBoost > 0)
		ctx.drawImage(
			tex_powerup5,
			canvas.width - (82  + (player2.immortalBoost * UI_POWERUP_ADJUST)),
			(canvas.height - 67)  - (player2.immortalBoost * UI_POWERUP_ADJUST),
			UI_POWERUP_SIZE * player2.immortalBoost,
			UI_POWERUP_SIZE * player2.immortalBoost);
}

// --- Returns to Menu ---
function EndGame ()
{
	inGame = false;
	inMenu = true;
	progressToGame = 200;
	aliens.splice(0);
	bullets.splice(0);
	powerups.splice(0);
	exhausts.splice(0);
	player1 = null;
	player2 = null;
}

// --- Keyboard Input (Down) ---
document.addEventListener("keydown", function (e)
{
	// Stops scrolling with arrows and space bar
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1)
        e.preventDefault();

	// If in menu
	if (inMenu && progressToGame <= 0) {
		StartGame();
		inGame = true;
	}

	keysDown[e.keyCode] = true;
});

// --- Keyboard Input (Up) ---
document.addEventListener("keyup", function (e)
{
	keysDown[e.keyCode] = false;
});

// ==================== ON LOAD ====================

// Starts menu
SetupGame();

// Start loop
setInterval(Update, 10);
