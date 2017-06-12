var Game = (function () {
    function Game(canvasName) {
        this.E = 0;
        this.W = 1;
        this.P = 2;
        this.G = 3;
        this.F = 4;
        this.N = 5;
        this.M = 6;
        this.I = 7;
        this.L = 8;
        this.objets = ['Empty', 'Wall', 'Player', 'Goal', 'Fog', 'Enemy1', 'Enemy2', 'Reward1', 'Reward2'];
        this.envColors = ['white', 'orange', 'blue', 'green', 'grey', 'red', 'brown', 'yellow', 'pink'];
        this.moving = false;
        this.ARROW_KEY_LEFT = 37;
        this.ARROW_KEY_UP = 38;
        this.ARROW_KEY_RIGHT = 39;
        this.ARROW_KEY_DOWN = 40;
        this.I_KEY_DOWN = 73;
        this.A_KEY_DOWN = 65;
        this.W_KEY_DOWN = 87;
        this.D_KEY_DOWN = 68;
        this.S_KEY_DOWN = 83;
        this.steps = 0;
        this.Maze = [[]];
        this.FoggedMaze = [[]];
        this.Stage = new createjs.Stage(Utils.$(canvasName));
        this.Canvas = this.Stage.canvas;
        this.player = new Player(0, 0);
        this.setMaze();
        window.onkeydown = this.onDPad.bind(this);
        createjs.Ticker.addEventListener("tick", this.handledTick.bind(this));
        createjs.Ticker.setFPS(60);
    }
    Game.prototype.handledTick = function () {
        this.Stage.update();
    };
    Game.prototype.setMaze = function () {
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
        for (var i = 0; i < this.Maze.length; i++) {
            var row = this.Maze[i];
            for (var j = 0; j < row.length; j++) {
                var col = row[j];
                if (col == this.P) {
                    this.player.CurrentPosition.x = i;
                    this.player.CurrentPosition.y = j;
                    this.player.StartPosition.x = i;
                    this.player.StartPosition.y = j;
                }
            }
        }
        document.getElementById('steps').textContent = this.steps.toString();
        this.block = new Block(this.Canvas.width / this.Maze[0].length, this.Canvas.height / this.Maze.length);
        this.generateCanvas(this.FoggedMaze, true);
    };
    Game.prototype.generateCanvas = function (maze, generatePlayer) {
        var _this = this;
        var x = 0;
        var y = 0;
        maze.forEach(function (row) {
            row.forEach(function (col) {
                var fillCollor = _this.envColors[col];
                switch (col) {
                    case _this.P:
                        _this.addShapeToStage('rectangle', x, y, 'black', _this.envColors[_this.E]);
                        _this.player.PlayerShape = _this.addShapeToStage('circle', x, y, 'black', fillCollor);
                        break;
                    case _this.M:
                        _this.addShapeToStage('circle', x, y, 'black', fillCollor);
                        break;
                    case _this.N:
                        _this.addShapeToStage('circle', x, y, 'black', fillCollor);
                        break;
                    case _this.I:
                        _this.addShapeToStage('star', x, y, 'black', fillCollor);
                        break;
                    case _this.L:
                        _this.addShapeToStage('star', x, y, 'black', fillCollor);
                        break;
                    default:
                        _this.addShapeToStage('rectangle', x, y, 'black', fillCollor);
                        break;
                }
                x += _this.block.width;
            });
            x = 0;
            y += _this.block.height;
        });
    };
    Game.prototype.addShapeToStage = function (type, x, y, strokeCollor, fillCollor) {
        var shape;
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
    };
    Game.prototype.movePlayer = function (direction) {
        this.steps++;
        document.getElementById('steps').textContent = this.steps.toString();
        switch (direction) {
            case 'up':
                if (this.checkCollision(new Positioning(this.player.CurrentPosition.x - 1, this.player.CurrentPosition.y))) {
                    createjs.Tween.get(this.player.PlayerShape).to({ y: this.player.CurrentPosition.x * this.block.height }, 500);
                }
                break;
            case 'down':
                if (this.checkCollision(new Positioning(this.player.CurrentPosition.x + 1, this.player.CurrentPosition.y))) {
                    createjs.Tween.get(this.player.PlayerShape).to({ y: this.player.CurrentPosition.x * this.block.height }, 500);
                }
                break;
            case 'left':
                if (this.checkCollision(new Positioning(this.player.CurrentPosition.x, this.player.CurrentPosition.y - 1))) {
                    createjs.Tween.get(this.player.PlayerShape).to({ x: this.player.CurrentPosition.y * this.block.width }, 500);
                }
                break;
            case 'right':
                if (this.checkCollision(new Positioning(this.player.CurrentPosition.x, this.player.CurrentPosition.y + 1))) {
                    createjs.Tween.get(this.player.PlayerShape).to({ x: this.player.CurrentPosition.y * this.block.width }, 500);
                }
                break;
            default:
                break;
        }
    };
    Game.prototype.checkCollision = function (position) {
        var moveBlock = this.Maze[position.x][position.y];
        var numChild = position.x == 0 ? position.y : position.x * this.Maze.length + position.y;
        var blockTo = this.Stage.children[numChild];
        switch (moveBlock) {
            case this.W:
                this.FoggedMaze[position.x][position.y] = this.W;
                blockTo.graphics.beginFill(this.envColors[this.W]).drawRect(0, 0, this.block.width, this.block.height).endFill();
                this.setLog('Boom... You hit the wall!');
                return false;
            case this.E:
                this.FoggedMaze[position.x][position.y] = this.E;
                this.player.setPosition(position.x, position.y);
                this.Maze[position.x][position.y] = this.P;
                this.Maze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
                this.FoggedMaze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill();
                return true;
            case this.G:
                this.FoggedMaze[position.x][position.y] = this.E;
                this.player.setPosition(position.x, position.y);
                this.Maze[position.x][position.y] = this.P;
                this.Maze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
                this.FoggedMaze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
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
                blockTo.graphics.beginFill(this.envColors[this.M]).drawCircle(this.block.width / 2, this.block.height / 2, this.block.width / 4).endFill();
                this.setLog('Bammm... You Got Hit!');
                this.setLog('Your game was reset');
                createjs.Tween.get(this.player.PlayerShape).to({ y: this.player.StartPosition.x * this.block.height, x: this.player.StartPosition.y * this.block.width }, 500);
                this.player.setPosition(this.player.StartPosition.x, this.player.StartPosition.y);
                this.FoggedMaze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
                this.Maze[this.player.PreviousPosition.x][this.player.PreviousPosition.y] = this.E;
                return false;
            case this.N:
                this.FoggedMaze[position.x][position.y] = this.N;
                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill();
                blockTo.graphics.beginFill(this.envColors[this.N]).drawCircle(this.block.width / 2, this.block.height / 2, this.block.width / 4).endFill();
                this.setLog('Bammm... You Got Hit Harder!');
                this.setLog('GAME OVER!!');
                document.getElementById('canvas').style.visibility = 'hidden';
                document.getElementById('gameOver').style.visibility = 'visible';
                return false;
            case this.I:
                this.FoggedMaze[position.x][position.y] = this.I;
                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill();
                blockTo.graphics.beginFill(this.envColors[this.I]).drawPolyStar(this.block.width / 2, this.block.height / 2, this.block.width / 4, 5, 0.6, 0).endFill();
                this.setLog('Tadaaa... You got a sword!');
                document.getElementById('item1').textContent = "Greater Sword of Tomorrow!";
                return false;
            case this.L:
                this.FoggedMaze[position.x][position.y] = this.L;
                blockTo.graphics.beginFill(this.envColors[this.E]).drawRect(0, 0, this.block.width, this.block.height).endFill();
                blockTo.graphics.beginFill(this.envColors[this.L]).drawPolyStar(this.block.width / 2, this.block.height / 2, this.block.width / 4, 5, 0.6, 0).endFill();
                this.setLog('Tadaaa... You got a shield!');
                document.getElementById('item2').textContent = "Greater Shield of Yesterday!";
                return false;
            default:
                break;
        }
    };
    Game.prototype.onDPad = function (e) {
        if (this.moving == false) {
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
                    if (document.getElementById('inventory').style.visibility == 'hidden') {
                        document.getElementById('inventory').style.visibility = 'visible';
                    }
                    else {
                        document.getElementById('inventory').style.visibility = 'hidden';
                    }
                    break;
            }
            this.moving = false;
        }
    };
    Game.prototype.setLog = function (message) {
        var ul = document.getElementById("log");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(message));
        ul.insertBefore(li, ul.childNodes[0]);
    };
    return Game;
}());
var Player = (function () {
    function Player(x, y) {
        this.CurrentPosition = { x: 0, y: 0 };
        this.PreviousPosition = { x: 0, y: 0 };
        this.StartPosition = { x: 0, y: 0 };
        this.Steps = 0;
        this.CurrentPosition = { x: x, y: y };
    }
    Player.prototype.setPosition = function (x, y) {
        this.PreviousPosition.x = this.CurrentPosition.x;
        this.PreviousPosition.y = this.CurrentPosition.y;
        this.CurrentPosition.x = x;
        this.CurrentPosition.y = y;
    };
    return Player;
}());
var Positioning = (function () {
    function Positioning(x, y) {
        this.x = x;
        this.y = y;
    }
    return Positioning;
}());
var Block = (function () {
    function Block(width, heigth) {
        this.width = width;
        this.height = heigth;
    }
    return Block;
}());
var Utils = (function () {
    function Utils() {
    }
    Utils.generateRectange = function (strokeCollor, fillCollor, x, y, width, height) {
        var rectangle = new createjs.Shape();
        rectangle.graphics.beginStroke(strokeCollor);
        rectangle.graphics.beginFill(fillCollor);
        rectangle.graphics.drawRect(0, 0, width, height);
        rectangle.x = x;
        rectangle.y = y;
        return rectangle;
    };
    Utils.generateCircle = function (strokeCollor, fillCollor, x, y, width, height, radius) {
        var circle = new createjs.Shape();
        circle.graphics.beginStroke(strokeCollor);
        circle.graphics.beginFill(fillCollor);
        circle.graphics.drawCircle(width, height, radius);
        circle.x = x;
        circle.y = y;
        return circle;
    };
    Utils.generateStar = function (strokeCollor, fillCollor, x, y, startX, startY, radius, sides, pointSize, angle) {
        var poly = new createjs.Shape();
        poly.graphics.beginStroke(strokeCollor);
        poly.graphics.beginFill(fillCollor);
        poly.graphics.drawPolyStar(startX, startY, radius, sides, pointSize, angle);
        poly.x = x;
        poly.y = y;
        return poly;
    };
    Utils.generateRoundedRectangle = function (strokeCollor, fillCollor, x, y, startX, startY, width, height, radius) {
        var roundedRectangle = new createjs.Shape();
        roundedRectangle.graphics.beginStroke(strokeCollor);
        roundedRectangle.graphics.beginFill(fillCollor);
        roundedRectangle.graphics.drawRoundRect(startX, startY, width, height, radius);
        roundedRectangle.x = roundedRectangle.y = x;
        return roundedRectangle;
    };
    Utils.$ = function (id) {
        return document.getElementById(id);
    };
    return Utils;
}());
var x = new Game('canvas');
//# sourceMappingURL=game.js.map