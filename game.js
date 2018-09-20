// Screen dimensions
const WIDTH = 1000;
const HEIGHT = 500;
const STARS = 500;
var sound1 = new Audio('fire.mp3');

// Get random positions
var cryptObj = window.crypto || window.msCrypto; // for IE 11
var positions = new Int16Array(STARS);
cryptObj.getRandomValues(positions);


//game variables.
var eBulletInterval = 400;
var gameOver = false;
var victory  = false;
var Dir = false;
var lives = 3;
var eBullets = [];
var aliens = [];
var bullets = [];
var Player= new PLAYER(10+WIDTH/2,450,20,20);
var score = 0;



// Create the screen canvas and context
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = HEIGHT;
screen.width = WIDTH;
document.body.appendChild(screen);
screenCtx.font = "30px Italic";

// Create the back buffer and context
var backBuffer = document.createElement('canvas');
var backBufferCtx = screen.getContext('2d');
backBuffer.height = HEIGHT;
backBuffer.width = WIDTH;


// the aliens shooting bullets at random intervals.
setInterval(function(){
  var ran=Math.floor((Math.random() * aliens.length) + 0);
    eBullets.push( new EBullet (aliens[ran].x-40 ,aliens[ran].y, 1));
}, eBulletInterval);

function checkLose (){
for (var i = 0; i < aliens.length; i++) {
    if (lives <= 0  || aliens[i].y >= Player.y){
      gameOver = true;
    }
}
}


 function changeDirection (){
   if (Dir) {
     Dir = false;
   }
   else if (!Dir){
     Dir = true;
   }
 }
// Function to spawn the Aliens on screen.
function spawnAliens(){
var cordX=0;
    for (var i = 0; i < 10; i++) {
      cordX += 50;
    aliens.push ( new Alien (cordX,10));
    }

}


/* Game state variables */
var start = null;
var currentInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}

var priorInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}



function PLAYER (x,y,width,height){
   this.x = x;//WIDTH/2;
   this.y = y;//450;
   this.width = width;
   this.height = height;

}






function handlekeydown (event){
switch (event.key){
  case " " :
    currentInput.space = true;
    break;
case  'ArrowLeft' :
case  'a'  :
 currentInput.left = true;
 break;
 case  'ArrowRight' :
 case 'd' :
 currentInput.right = true;
 break;
 case 'ArrowUp':
 case 'w':
   currentInput.up = true;
}
}
window.addEventListener ('keydown',handlekeydown );
spawnAliens();


function handlekeyup (event){
switch (event.key){
  case " " :
    currentInput.space = false;
    break;
case  'ArrowLeft' :
case  'a'  :
 currentInput.left = false;
 break;
 case  'ArrowRight' :
 case 'd' :
 currentInput.right = false;
 break;
 case 'ArrowUp':
 case 'w':
   currentInput.up = false;

}
}
window.addEventListener('keyup',handlekeyup);


  function loop(timestamp) {
    render(backBufferCtx);
    if(!start) start = timestamp;
    var elapsedTime = timestamp - start;
    start = timestamp;
    update(elapsedTime);

    pollInput();
    window.requestAnimationFrame(loop);
  }




/** @function pollInput
  * Copies the current input into the previous input
  */
function pollInput() {
  priorInput = JSON.parse(JSON.stringify(currentInput));
}





/** @function intersects
  * check for collision between and alien and a bullet or a bullet and the player's ship
  */
function intersects(circle, rect) {
    var cX = Math.abs(circle.x - rect.x);
    var cY = Math.abs(circle.y - rect.y);

    if (cX > (rect.width/2 + circle.r)) { return false; }
    if (cY > (rect.height/2 + circle.r)) { return false; }

    if (cX <= (rect.width/2)) { return true; }
    if (cY <= (rect.height/2)) { return true; }


}

var interv = setInterval(3000);
function update(elapsedTime) {
  // render into back buffer
  render(backBufferCtx);
//check for lose conditions


//checks for aliens hitting the walls and changing direction afterward.
 for (var i = 0; i < aliens.length; i++) {

   if ( (aliens[i].x  >= WIDTH)) {
     for (var j = 0; j < aliens.length; j++) {
           aliens[j].shiftDown();
           }
           changeDirection();
}

    else if (aliens[i].x <= 0) {
      for (var k = 0; k < aliens.length; k++) {
            aliens[k].shiftDown();
            }
            changeDirection();
           }
}


  if(currentInput.space && !priorInput.space) {
    // TODO: Fire bullet]

    bullets.push ( new Bullet (Player.x+20,Player.y,1));

  }
  //TODO: Move Left.

{
  if(currentInput.left) {
     if (Player.x <= 0)
     {
     }
     else {
       Player.x -= 0.2 * elapsedTime;
    //   console.log(x);
     }
  }

  //TODO: Move right
  if(currentInput.right) {
    if (Player.x >= WIDTH-40){

    }
    else {
      Player.x += 0.2 * elapsedTime;
    //  console.log(x);
    }

  }
}

aliens.forEach(function(alien){
  alien.update(elapsedTime);
});


//check for player's bullet hitting an alien and updating score.
   bullets.forEach(function(bullet, index){
     for (var i = 0; i < aliens.length; i++) {
          if(intersects(bullet,aliens[i]))
            {
                aliens.splice(i,1);
                 score += 100;
                bullets.splice(index, 1);
              }
            }

    bullet.update(elapsedTime);

    // check to see if bullet is off-screen
    if(bullet.x >=  WIDTH + bullet.r) bullets.splice(index, 1);
  });

//check if the alien's bullet hit the player and
  eBullets.forEach(function (ebullet,index)
{
  if (intersects (ebullet,Player))
  {
    lives--;
       sound1.play();
    eBullets.splice(index,1);
  }
  ebullet.update(elapsedTime);
});


// flip buffers
screenCtx.drawImage(backBuffer, 0, 0);


}//closing bracket for Update function.

function render(ctx) {
checkLose ();

if(gameOver) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillText("You Lose.",WIDTH/2,HEIGHT/2)
}
else if (aliens[0] == null)  { ctx.clearRect(0, 0, WIDTH, HEIGHT);
   {ctx.fillText("You Win. Your Score is :" + score + "  and your Health is :" + lives,WIDTH/2 - 400,HEIGHT/2);}}
else{
   ctx.clearRect(0, 0, WIDTH, HEIGHT);

   // render the squares
   for(var i = 0; i < STARS - 1; i++) {
     ctx.fillStyle = 'white' + positions[i].toString(16);
     ctx.fillRect(positions[i] % WIDTH, positions[i+1] % HEIGHT, 1, 1);
     ctx.fillRect(positions[i+1] % WIDTH, positions[i] % HEIGHT, 1, 1);
   }
   ctx.fillStyle = "white";
   ctx.fillText("Score:"+score,0,HEIGHT);
   ctx.fillText("Health:"+lives,WIDTH-100,HEIGHT);


   ctx.fillRect(10+Player.x,10+Player.y,20,20);



     aliens.forEach ( function (alien){
     alien.render(ctx);

   });

   bullets.forEach(function(bullet){
     bullet.render(ctx);
   });
   eBullets.forEach(function(ebullet){
     ebullet.render(ctx);
   });}


}//closing bracket for render function
// Start the game loop
window.requestAnimationFrame(loop);


//player's bullet class
function Bullet  (x,y,r){
  this.x=x;
  this.y=y;
  this.r=r;
}
//alien's bullet class
function EBullet (x,y,r){
  this.x=x;
  this.y=y;
  this.r=r;
}
//alien class
function Alien (x,y) {
this.x = x;
this.y = y;
this.height = 30;
this.width = 30;
//function to shift the aliens down .
this.shiftDown = function (){
          this.y += 15;
        }
     }



EBullet.prototype.update = function(deltaT) {
       this.y += deltaT* 0.1;
     }

//Bullet speed and direction.
Bullet.prototype.update = function(deltaT) {
  this.y -= deltaT* 0.3;
}
Alien.prototype.update = function (deltaT) {

  switch (Dir) {
    case false:
       this.x += 3.1;
      break;
      case true:
      this.x -= 3.1;
      break;
  }

  }


Alien.prototype.render = function (context){
  context.clearRect(this.x, this.y, 0, 0);
  context.fillStyle = 'magenta';


  context.fillRect(this.x,this.y,this.width,this.height);
}

EBullet.prototype.render = function(context) {
  context.beginPath();
  context.fillStyle = 'cyan';
  context.arc(this.x - this.r, this.y - this.r, 2*this.r, 2*this.r, 0, 2 * Math.pi);
  context.fill();
}


Bullet.prototype.render = function(context) {
  context.beginPath();
  context.fillStyle = 'red';
  context.arc(this.x - this.r, this.y - this.r, 2*this.r, 2*this.r, 0, 2 * Math.pi);
  context.fill();
}
