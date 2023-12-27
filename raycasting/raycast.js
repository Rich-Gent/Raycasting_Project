const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI/180);

//width of pixel columns
const WALL_STRIP_WIDTH = 3;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y){
        if(x<0 || x>WINDOW_WIDTH || y<0 || y>WINDOW_HEIGHT){
            return true;
        }
        var mapGridIndexX = Math.floor(x / TILE_SIZE);
        var mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] !=0 ;
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class Player{
    constructor(){
        this.x = WINDOW_WIDTH/2;
        this.y = WINDOW_HEIGHT/2;
        this.radius = 3;
        this.turnDirection = 0; //-1 if left, +1 if right
        this.walkDirection = 0 ; //-1 if back, +1 if front
        this.rotationAngle = Math.PI/2;
        this.moveSpeed = 2.0; //pixels per frame
        this.rotationSpeed = 2*(Math.PI/180) //converting to radians
    }
    update(){
        
        //update player position based on turn and walk direction
        this.rotationAngle += this.rotationSpeed*this.turnDirection
        //how much to move per frame
        var moveStep = this.walkDirection * this.moveSpeed
        var newPlayerX = this.x + Math.cos(this.rotationAngle)*moveStep
        var newPlayerY = this.y + Math.sin(this.rotationAngle)*moveStep
        //only set new player position if not colliding with the map walls
        if(!grid.hasWallAt(newPlayerX,newPlayerY)){
            this.x=newPlayerX
            this.y=newPlayerY
        }
    }
    render(){
        noStroke();
        fill("red");
        circle(this.x,this.y, this.radius);
        stroke("red");
        //draw line to see which way we are facing
        line(this.x,this.y, this.x+Math.cos(this.rotationAngle)*20,this.y+ Math.sin(this.rotationAngle)*20);
    }
}
class Ray{
    constructor(rayAngle){
        this.rayAngle = normaliseAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        //check which way rays are facing
        //between 0 and PI
        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;
        //between 3PI/2 and PI/2
        this.isRayFacingRight = (this.rayAngle >(3*Math.PI)/2) || (this.rayAngle<Math.PI/2)
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast(columnId){
        var xIntercept, yIntercept;
        var xStep, yStep;
        ////////////////////////////////////////////
        //HORIZONTAL RAY-GRID INTERSECTION CODE
        ////////////////////////////////////////////
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;
        //Find the y and x coordinate of the closest horizontal grid intersection
        yIntercept = Math.floor(player.y/TILE_SIZE)*TILE_SIZE;
        yIntercept += this.isRayFacingDown ? TILE_SIZE : 0;

        xIntercept = player.x + ((yIntercept-player.y)/Math.tan(this.rayAngle))
        
        //calculate the increment xStep and yStep
        yStep = TILE_SIZE;
        yStep *= this.isRayFacingUp ? -1 : 1;

        xStep = TILE_SIZE / Math.tan(this.rayAngle);
        //if ray is facing left or right account for this and change xStep
        xStep *= (this.isRayFacingLeft && xStep>0) ? -1 : 1;
        xStep *= (this.isRayFacingRight && xStep<0) ? -1 : 1;

        //find next intercepts
        var nextHorzTouchX = xIntercept;
        var nextHorzTouchY = yIntercept;

        if(this.isRayFacingUp){
            nextHorzTouchY--;
        }
        //increment xStep and yStep until we find a wall
        while(nextHorzTouchX >=0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >=0 && nextHorzTouchY<=WINDOW_HEIGHT){
            if(grid.hasWallAt(nextHorzTouchX,nextHorzTouchY)){
                //found a wall hit
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                break;
            }else{
                nextHorzTouchX +=xStep;
                nextHorzTouchY +=yStep;
            }
        }
        ////////////////////////////////////////////
        //VERTICAL RAY-GRID INTERSECTION CODE
        ////////////////////////////////////////////
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;
        //Find the y and x coordinate of the closest vertical grid intersection
        xIntercept = Math.floor(player.x/TILE_SIZE)*TILE_SIZE;
        xIntercept += this.isRayFacingRight ? TILE_SIZE : 0;

        yIntercept = player.y + ((xIntercept-player.x)*Math.tan(this.rayAngle))
        
        //calculate the increment xStep and yStep
        xStep = TILE_SIZE;
        xStep *= this.isRayFacingLeft ? -1 : 1;

        yStep = TILE_SIZE * Math.tan(this.rayAngle);
        //if ray is facing left or right account for this and change xStep
        yStep *= (this.isRayFacingUp && yStep>0) ? -1 : 1;
        yStep *= (this.isRayFacingDown && yStep<0) ? -1 : 1;

        //find next intercepts
        var nextVertTouchX = xIntercept;
        var nextVertTouchY = yIntercept;
        //add a pixel to find wall
        if(this.isRayFacingLeft){
            nextVertTouchX--;
        }
        //increment xStep and yStep until we find a wall
        while(nextVertTouchX >=0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >=0 && nextVertTouchY<=WINDOW_HEIGHT){
            if(grid.hasWallAt(nextVertTouchX,nextVertTouchY)){
                //found a wall hit
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            }else{
                nextVertTouchX +=xStep;
                nextVertTouchY +=yStep;
            }
        }

        //calculate both horizontal and vertical distances and choose the smallest value
        var horzHitDistance = (foundHorzWallHit) ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) : Number.MAX_VALUE;
        var vertHitDistance = (foundVertWallHit) ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;
        //only store the smallest of the distances
        this.wallHitX = (horzHitDistance < vertHitDistance) ? horzWallHitX : vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance) ? horzWallHitY : vertWallHitY;
        this.distance = (horzHitDistance < vertHitDistance) ? horzHitDistance : vertHitDistance;
        this.wasHitVertical = (vertHitDistance < horzHitDistance);
    }
    render(){
        stroke("purple");
        line(player.x, player.y, this.wallHitX, this.wallHitY);
    }
}
var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed(){
    if (keyCode == UP_ARROW){
        player.walkDirection = 1;
    }else if (keyCode == DOWN_ARROW){
        player.walkDirection = -1;
    }else if (keyCode == RIGHT_ARROW){
        player.turnDirection = 1;
    }else if (keyCode == LEFT_ARROW){
        player.turnDirection = -1;
    }
}

function keyReleased(){
    if (keyCode == UP_ARROW){
        player.walkDirection = 0;
    }else if (keyCode == DOWN_ARROW){
        player.walkDirection = 0;
    }else if (keyCode == RIGHT_ARROW){
        player.turnDirection = 0;
    }else if (keyCode == LEFT_ARROW){
        player.turnDirection = 0;
    }
}

function castAllRays(){
    var columnId = 0;

    //start first ray subtracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE/2);
    rays = [];

    //loop all columns casting the rays
    for(var i=0; i< NUM_RAYS; i++){
        var ray = new Ray(rayAngle);
        //find wall to stop ray
        ray.cast(columnId);
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
        columnId++;
    }
}
//keep angle within correct parameters (correct for negative angles)
function normaliseAngle(angle){
    //dont go beyond 2 PI
    angle = angle % (2*Math.PI);
    //convert to positive angle
    if(angle<0){
        angle = (2*Math.PI) + angle;
    }
    return angle;
}

function distanceBetweenPoints(x1,y1,x2,y2){
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}


function setup() {
    //initialise all objects
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

function update() {
    //update all game objects before we render the next frame
    player.update();
    castAllRays();
}

function draw() {
    //render all objects frame by frame
    update();

    grid.render();
    for(ray of rays){
        ray.render();
    }
    player.render();
    
}


