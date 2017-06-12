class Game {
    private E = 0; 
    private W = 1; 
    private P = 2; 
    private G = 3; 
    private F = 4; 
    private N = 5; 
    private M = 6; 
    private I = 7; 
    private L = 8;
    private objets = ['Empty', 'Wall', 'Player', 'Goal', 'Fog', 'Enemy1', 'Enemy2', 'Reward1', 'Reward2'];
    private envColors = ['white', 'orange', 'blue', 'green', 'grey', 'red', 'brown', 'yellow', 'pink'];

    private moving: boolean =  false;

    private ARROW_KEY_LEFT = 37;
    private ARROW_KEY_UP = 38;
    private ARROW_KEY_RIGHT = 39;
    private ARROW_KEY_DOWN = 40;
    private I_KEY_DOWN = 73;
    private A_KEY_DOWN = 65;
    private W_KEY_DOWN = 87;
    private D_KEY_DOWN = 68;
    private S_KEY_DOWN = 83;

    public Canvas: HTMLCanvasElement;
    public Stage: createjs.Stage;
    public Tween: createjs.TweenJS;
    public player: Player;
    public block: Block;

    public steps: number = 0;

    private Maze: Array<Array<number>> = [[]];
    private FoggedMaze: Array<Array<number>> = [[]];

    constructor(canvasName: string) {
        this.Stage = new createjs.Stage(Utils.$(canvasName));
        this.Canvas = <HTMLCanvasElement>this.Stage.canvas;
        this.player = new Player(0,0);

        this.setMaze();
        window.onkeydown = this.onDPad.bind(this);

        createjs.Ticker.addEventListener("tick", this.handledTick.bind(this));
        createjs.Ticker.setFPS(60);
    }

    public handledTick() {     
        this.Stage.update();
    }

    public setMaze() {
        this.Maze = [
            [this.E, this.E, this.G, this.W, this.W, this.W, this.W, this.W],
            [this.E, this.M, this.E, this.E, this.W, this.E, this.E, this.W],
            [this.E, this.W, this.W, this.W, this.E, this.E, this.E, this.W],
            [this.E, this.E, this.E, this.E, this.E, this.W, this.E, this.W],
            [this.W, this.W, this.E, this.W, this.W, this.W, this.E, this.W],
            [this.W, this.W, this.E, this.E, this.E, this.W, this.E, this.W],
            [this.N, this.E, this.E, this.W, this.E, this.W, this.E, this.W],
            [this.I, this.E, this.W, this.W, this.E, this.W, this.E, this.P]
        ];

        this.FoggedMaze = [
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.F],
            [this.F, this.F, this.F, this.F, this.F, this.F, this.F, this.P]
        ];

        //setting initial player position
        for (var i = 0; i < this.Maze.length; i++) {
            var row = this.Maze[i];
            for (var j = 0; j < row.length; j++) {
                var col = row[j];
                if (col == this.P) {
                    this.player.CurrentPosition.x = i;
                    this.player.CurrentPosition.y = j;
                    this.player.StartPosition.x =i;
                    this.player.StartPosition.y =j;
                }
            }

        }

        //set initial steps
        document.getElementById('steps').textContent = this.steps.toString();

        //setting block size
        this.block = new Block(this.Canvas.width / this.Maze[0].length, this.Canvas.height / this.Maze.length)

        //generate first Canvas
        this.generateCanvas(this.FoggedMaze, true);
    }

    public generateCanvas(maze: Array<Array<number>>, generatePlayer: boolean) {
        let x = 0;
        let y = 0;

        maze.forEach(row => {
            row.forEach(col => {
                let fillCollor = this.envColors[col];
                switch (col) {
                    case this.P:
                            this.addShapeToStage('rectangle', x, y, 'black', this.envColors[this.E]);
                            this.player.PlayerShape = this.addShapeToStage('circle', x, y, 'black', fillCollor); 
                        break;
                    case this.M:
                        this.addShapeToStage('circle', x, y, 'black', fillCollor);
                        break;
                    case this.N:
                        this.addShapeToStage('circle', x, y, 'black', fillCollor);
                        break;
                    case this.I:
                        this.addShapeToStage('star', x, y, 'black', fillCollor);
                        break;
                    case this.L:
                        this.addShapeToStage('star', x, y, 'black', fillCollor);
                        break;
                    default:
                        this.addShapeToStage('rectangle', x, y, 'black', fillCollor);
                        break;
                }
                x += this.block.width;
            });
            x = 0;
            y += this.block.height;
        });
    }

    //Adding Shapes to Stage
    private addShapeToStage(type: string, x: number, y: number, strokeCollor: string, fillCollor: string) : createjs.Shape {
        let shape;
        switch (type) {
            case 'rectangle':
                shape = Utils.generateRectange(strokeCollor, fillCollor, x, y, this.block.width, this.block.height);
                break;
            case 'circle':
                shape = Utils.generateCircle(strokeCollor, fillCollor, x, y, this.block.width / 2, this.block.height / 2, this.block.width / 4);
                break;
            case 'star':
                shape = Utils.generateStar(strokeCollor, fillCollor, x, y, this.block.width / 2, this.block.height / 2, this.block.width / 4, 5, 0.6, 0);
                break;
            default:
                shape = Utils.generateRectange(strokeCollor, fillCollor, x, y, this.block.width, this.block.height);
                break;
        }

        this.Stage.addChild(shape);
        return shape;
    }

    public movePlayer(direction:string){
        this.steps++;
        document.getElementById('steps').textContent = this.steps.toString();

        switch (direction) {
            case 'up':
                if(this.checkCollision(new Positioning(this.player.CurrentPosition.x-1, this.player.CurrentPosition.y))){                   
                    //createjs.Tween.get(this.player.PlayerShape).to({y:this.player.PlayerShape.y - this.block.height}, 500);

                    createjs.Tween.get(this.player.PlayerShape).to({y:this.player.CurrentPosition.x * this.block.height}, 500);                 
                }                
                break;
            case 'down':
                if(this.checkCollision(new Positioning(this.player.CurrentPosition.x +1, this.player.CurrentPosition.y))){
                      createjs.Tween.get(this.player.PlayerShape).to({y:this.player.CurrentPosition.x * this.block.height}, 500);
                }
                break;
            case 'left':
                if(this.checkCollision(new Positioning(this.player.CurrentPosition.x, this.player.CurrentPosition.y -1 ))){
                    createjs.Tween.get(this.player.PlayerShape).to({x:this.player.CurrentPosition.y * this.block.width}, 500);
                }
                break;
            case 'right':
                if(this.checkCollision(new Positioning(this.player.CurrentPosition.x, this.player.CurrentPosition.y + 1 ))){
                    createjs.Tween.get(this.player.PlayerShape).to({x:this.player.CurrentPosition.y * this.block.width}, 500);
                }                
                break;        
            default:
                break;
        }
    }

    private checkCollision(position: Positioning): boolean{

        let moveBlock :number = this.Maze[position.x][position.y];
        let numChild : number = position.x == 0 ? position.y : position.x * this.Maze.length  + position.y;  // get the blockTo array position
        let blockTo =<createjs.Shape>this.Stage.children[numChild];

        switch (moveBlock) {
            case this.W:
                this.FoggedMaze[position.x][position.y] = this.W;
               
                blockTo.graphics.beginFill(this.envColors[this.W]).drawRect(0, 0, this.block.width, this.block.height).endFill();  

                this.setLog('Boom... You hit the wall!');             
                                      
                return false;
            case this.E:
                this.FoggedMaze[position.x][position.y] = this.E;
                this.player.setPosition(position.x,position.y); // change player logical position 
                this.Maze[position.x][position.y] = this.P; //set new player position 
                this.Maze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E; // set previous position in the maze   
                this.FoggedMaze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E; // set previous position in the foggedMaze
                
               
                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill();   

                return true;
            case this.G:
                this.FoggedMaze[position.x][position.y] = this.E;
                this.player.setPosition(position.x,position.y); // change player logical position 
                this.Maze[position.x][position.y] = this.P; //set new player position 
                this.Maze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E; // set previous position in the maze   
                this.FoggedMaze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E; // set previous position in the foggedMaze   

               
                blockTo.graphics.beginFill(this.envColors[this.G]).drawRect(0, 0, this.block.width, this.block.height).endFill(); 

                this.setLog('You Win!!!');  
                this.setLog('Awwweeesoooome!!');  
                this.setLog('THANK YOU FOR PLAYING!');  
                 

                document.getElementById('canvas').style.visibility = 'hidden';    
                document.getElementById('gameOver').style.visibility = 'visible'; 

                return true;                        
            case this.M:
                this.FoggedMaze[position.x][position.y] = this.M;

                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill(); 
                blockTo.graphics.beginFill(this.envColors[this.M]).drawCircle(this.block.width/2, this.block.height/2, this.block.width / 4,).endFill(); 

                this.setLog('Bammm... You Got Hit!'); 
                this.setLog('Your game was reset');

                createjs.Tween.get(this.player.PlayerShape).to({y:this.player.StartPosition.x * this.block.height, x: this.player.StartPosition.y * this.block.width}, 500);
                this.player.setPosition(this.player.StartPosition.x, this.player.StartPosition.y);               

                this.FoggedMaze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
                this.Maze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;

                return false;
            case this.N:
                this.FoggedMaze[position.x][position.y] = this.N;

                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill(); 
                blockTo.graphics.beginFill(this.envColors[this.N]).drawCircle(this.block.width/2, this.block.height/2, this.block.width / 4,).endFill(); 

                this.setLog('Bammm... You Got Hit Harder!');   
                this.setLog('GAME OVER!!');
                document.getElementById('canvas').style.visibility = 'hidden';    
                document.getElementById('gameOver').style.visibility = 'visible'; 
                
                return false;    
            case this.I:
                this.FoggedMaze[position.x][position.y] = this.I;

                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill(); 
                blockTo.graphics.beginFill(this.envColors[this.I]).drawPolyStar(this.block.width/2, this.block.height/2, this.block.width / 4, 5, 0.6, 0).endFill(); 

                this. setLog('Tadaaa... You got a sword!');
                document.getElementById('item1').textContent = "Greater Sword of Tomorrow!";
                
                return false;    
            case this.L:
                this.FoggedMaze[position.x][position.y] = this.L;

                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill(); 
                blockTo.graphics.beginFill(this.envColors[this.L]).drawPolyStar(this.block.width/2, this.block.height/2, this.block.width/4, 5, 0.6, 0).endFill(); 

                this.setLog('Tadaaa... You got a shield!');                   
                document.getElementById('item2').textContent = "Greater Shield of Yesterday!";
                
                return false;         
            default:
                break;
        }

        
    }   

    public onDPad(e: KeyboardEvent) {
        //enable/disable moving while in movement (tween fix)
        if(this.moving == false){
            this.moving = true;
            switch (e.keyCode) {
                case this.ARROW_KEY_LEFT:
                case this.A_KEY_DOWN:
                    console.log('move left');                    
                    this.movePlayer('left'); 
                    break;
                case this.ARROW_KEY_DOWN:
                case this.S_KEY_DOWN:
                    console.log('move down');                    
                    this.movePlayer('down'); 
                    break;
                case this.ARROW_KEY_RIGHT:
                case this.D_KEY_DOWN:
                    console.log('move right');                    
                    this.movePlayer('right'); 
                    break;
                case this.ARROW_KEY_UP:
                case this.W_KEY_DOWN:
                    console.log('move up and down');                    
                    this.movePlayer('up');                
                    break;
                case this.I_KEY_DOWN:
                    console.log('Opening/Closing Inventory');
                    if (document.getElementById('inventory').style.visibility == 'hidden'){
                        document.getElementById('inventory').style.visibility = 'visible';
                    } else {
                        document.getElementById('inventory').style.visibility = 'hidden';
                    }
                    break;
            }
            this.moving = false;
        }
    }

    public setLog(message:string){        
        var ul = document.getElementById("log");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(message));
        ul.insertBefore(li, ul.childNodes[0]);    
    }
}



//Player Class
class Player {
    CurrentPosition: Positioning = { x: 0, y: 0 };
    PreviousPosition: Positioning = { x: 0, y: 0 };
    StartPosition: Positioning = {x:0, y:0};
    PlayerShape: createjs.Shape;
    Steps: number = 0;

    constructor(x: number, y: number) {
        this.CurrentPosition = { x: x, y: y };
    }

    public setPosition(x: number, y: number) {
        this.PreviousPosition.x = this.CurrentPosition.x;
        this.PreviousPosition.y = this.CurrentPosition.y;
        this.CurrentPosition.x = x;
        this.CurrentPosition.y = y;
    }

}

//Positioning helper
class Positioning {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Block {
    width: number;
    height: number;
    constructor(width: number, heigth: number) {
        this.width = width;
        this.height = heigth;
    }
}

// Utils to manage the code
class Utils {
    public static generateRectange(strokeCollor: string, fillCollor: string, x: number, y: number, width: number, height: number): createjs.Shape {
        let rectangle = new createjs.Shape();
        rectangle.graphics.beginStroke(strokeCollor);
        rectangle.graphics.beginFill(fillCollor);
        rectangle.graphics.drawRect(0, 0, width, height);
        rectangle.x = x
        rectangle.y = y;
        return rectangle;
    }

    public static generateCircle(strokeCollor: string, fillCollor: string, x: number, y: number, width: number, height: number, radius: number): createjs.Shape {
        let circle = new createjs.Shape();
        circle.graphics.beginStroke(strokeCollor);
        circle.graphics.beginFill(fillCollor);
        circle.graphics.drawCircle(width, height, radius);
        circle.x = x;
        circle.y = y;
        return circle;
    }

    public static generateStar(strokeCollor: string, fillCollor: string, x: number, y: number, startX: number, startY: number, radius: number, sides: number, pointSize: number, angle: number): createjs.Shape {
        let poly = new createjs.Shape();
        poly.graphics.beginStroke(strokeCollor);
        poly.graphics.beginFill(fillCollor);
        poly.graphics.drawPolyStar(startX, startY, radius, sides, pointSize, angle);
        poly.x = x;
        poly.y = y;
        return poly;
    }

    public static generateRoundedRectangle(strokeCollor: string, fillCollor: string, x: number, y: number, startX: number, startY: number, width: number, height: number, radius: number): createjs.Shape {
        let roundedRectangle = new createjs.Shape();
        roundedRectangle.graphics.beginStroke(strokeCollor);
        roundedRectangle.graphics.beginFill(fillCollor);
        roundedRectangle.graphics.drawRoundRect(startX, startY, width, height, radius);
        roundedRectangle.x = roundedRectangle.y = x;
        return roundedRectangle;
    }

    public static $(id: string) {
        return document.getElementById(id);
    }
}


let x = new Game('canvas');

