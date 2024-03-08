(function () {
    let isStart = false;
    let tetris = {
      board: [],
      boardDiv: null,
      canvas: null,
      pSize: 20,
      canvasHeight: 440,
      canvasWidth: 260,
      boardHeight: 0,
      boardWidth: 0,
      spawnX: 4,
      spawnY: 1,
      shapes: [
        [
          [-1, 1],
          [0, 1],
          [1, 1],
          [0, 0], //TEE
        ],
        [
          [-1, 0],
          [0, 0],
          [1, 0],
          [2, 0], //line
        ],
        [
          [-1, -1],
          [-1, 0],
          [0, 0],
          [1, 0], //L EL
        ],
        [
          [1, -1],
          [-1, 0],
          [0, 0],
          [1, 0], //R EL
        ],
        [
          [0, -1],
          [1, -1],
          [-1, 0],
          [0, 0], //R ess
        ],
        [
          [-1, -1],
          [0, -1],
          [0, 0],
          [1, 0], //L ess
        ],
        [
          [0, -1],
          [1, -1],
          [0, 0],
          [1, 0], //square
        ],
      ],
      tempShapes: null,
      curShape: null,
      curShapeIndex: null,
      curX: 0,
      curY: 0,
      curSqs: [],
      nextShape: null,
      nextShapeDisplay: null,
      nextShapeIndex: null,
      sqs: [],
      score: 0,
      scoreDisplay: null,
      level: 1,
      levelDisplay: null,
      numLevels: 10,
      time: 0,
      maxTime: 1000,
      timeDisplay: null,
      isActive: 0,
      curComplete: false,
      timer: null,
      sTimer: null,
      speed: 700,
      lines: 0,
  
      init: function () {
        isStart = true;
        this.canvas = document.getElementById('canvas');
        this.initBoard();
        this.initInfo();
        this.initLevelScores();
        this.initShapes();
        this.bindKeyEvents();
        this.play();
      },
      initBoard: function () {
        this.boardHeight = this.canvasHeight / this.pSize;
        this.boardWidth = this.canvasWidth / this.pSize;
        let s = this.boardHeight * this.boardWidth;
        for (let i = 0; i < s; i++) {
          this.board.push(0);
        }
        //this.boardDiv = document.getElementById('board); //for debugging
      },
      initInfo: function () {
        this.nextShapeDisplay = document.getElementById('next_shape');
        this.levelDisplay = document
          .getElementById('level')
          .getElementsByTagName('span')[0];
        this.timeDisplay = document
          .getElementById('time')
          .getElementsByTagName('span')[0];
        this.scoreDisplay = document
          .getElementById('score')
          .getElementsByTagName('span')[0];
        this.linesDisplay = document
          .getElementById('lines')
          .getElementsByTagName('span')[0];
        this.setInfo('time');
        this.setInfo('score');
        this.setInfo('level');
        this.setInfo('lines');
      },
      initShapes: function () {
        this.curSqs = [];
        this.curComplete = false;
        this.shiftTempShapes();
        this.curShapeIndex = this.tempShapes[0];
        this.curShape = this.shapes[this.curShapeIndex];
        this.initNextShape();
        this.setCurCoords(this.spawnX, this.spawnY);
        this.drawShape(this.curX, this.curY, this.curShape);
      },
      initNextShape: function () {
        if (typeof this.tempShapes[1] === 'undefined') {
          this.initTempShapes();
        }
        try {
          this.nextShapeIndex = this.tempShapes[1];
          this.nextShape = this.shapes[this.nextShapeIndex];
          this.drawNextShape();
        } catch (e) {
          throw new Error('Could not create next shape. ' + e);
        }
      },
      initTempShapes: function () {
        this.tempShapes = [];
        for (let i = 0; i < this.shapes.length; i++) {
          this.tempShapes.push(i);
        }
        let k = this.tempShapes.length;
        while (--k) {
          //Fisher Yates Shuffle
          let j = Math.floor(Math.random() * (k + 1));
          let tempk = this.tempShapes[k];
          let tempj = this.tempShapes[j];
          this.tempShapes[k] = tempj;
          this.tempShapes[j] = tempk;
        }
      },
      shiftTempShapes: function () {
        try {
          if (
            typeof this.tempShapes === 'undefined' ||
            this.tempShapes === null
          ) {
            this.initTempShapes();
          } else {
            this.tempShapes.shift();
          }
        } catch (e) {
          throw new Error('Could not shift or init tempShapes: ' + e);
        }
      },
      initTimer: function () {
        let me = this;
        let tLoop = function () {
          me.incTime();
          me.timer = setTimeout(tLoop, 2000);
        };
        this.timer = setTimeout(tLoop, 2000);
      },
      initLevelScores: function () {
        let c = 1;
        for (let i = 1; i <= this.numLevels; i++) {
          this['level' + i] = [c * 1000, 40 * i, 5 * i]; //for nxt level, row score, p sore,
          c = c + c;
        }
      },
      setInfo: function (el) {
        this[el + 'Display'].innerHTML = this[el];
      },
      drawNextShape: function () {
        let ns = [];
        for (let i = 0; i < this.nextShape.length; i++) {
          ns[i] = this.createSquare(
            this.nextShape[i][0] + 2,
            this.nextShape[i][1] + 2,
            this.nextShapeIndex
          );
        }
        this.nextShapeDisplay.innerHTML = '';
        for (let k = 0; k < ns.length; k++) {
          this.nextShapeDisplay.appendChild(ns[k]);
        }
      },
      drawShape: function (x, y, p) {
        for (let i = 0; i < p.length; i++) {
          let newX = p[i][0] + x;
          let newY = p[i][1] + y;
          this.curSqs[i] = this.createSquare(newX, newY, this.curShapeIndex);
        }
        for (let k = 0; k < this.curSqs.length; k++) {
          this.canvas.appendChild(this.curSqs[k]);
        }
      },
      createSquare: function (x, y, type) {
        let el = document.createElement('div');
        el.className = 'square type' + type;
        el.style.left = x * this.pSize + 'px';
        el.style.top = y * this.pSize + 'px';
        return el;
      },
      removeCur: function () {
        let me = this;
        this.curSqs.eachdo(function () {
          me.canvas.removeChild(this);
        });
        this.curSqs = [];
      },
      setCurCoords: function (x, y) {
        this.curX = x;
        this.curY = y;
      },
      bindKeyEvents: function () {
        let me = this;
        let event = 'keypress';
        if (this.isSafari() || this.isIE()) {
          event = 'keydown';
        }
        let cb = function (e) {
          me.handleKey(e);
        };
        if (window.addEventListener) {
          document.addEventListener(event, cb, false);
        } else {
          document.attachEvent('on' + event, cb);
        }
      },
      handleKey: function (e) {
        let c = this.whichKey(e);
        let dir = '';
        switch (c) {
          case 37:
            this.move('L');
            break;
          case 38:
            this.move('RT');
            break;
          case 39:
            this.move('R');
            break;
          case 40:
            this.move('D');
            break;
          case 27: // this is my pause button esc = pause
            this.togglePause();
            break;
          default:
            break;
        }
      },
      whichKey: function (e) {
        let c;
        if (window.event) {
          c = window.event.keyCode;
        } else if (e) {
          c = e.keyCode;
        }
        return c;
      },
      incTime: function () {
        this.time++;
        this.setInfo('time');
      },
      incScore: function (amount) {
        this.score = this.score + amount;
        this.setInfo('score');
      },
      incLevel: function () {
        this.level++;
        this.speed = this.speed - 75;
        this.setInfo('level');
      },
      incLines: function (num) {
        this.lines += num;
        this.setInfo('lines');
      },
      calcScore: function (args) {
        let lines = args.lines || 0;
        let shape = args.shape || false;
        let speed = args.speed || 0;
        let score = 0;
  
        if (lines > 0) {
          score += lines * this['level' + this.level][1];
          this.incLines(lines);
        }
        if (shape === true) {
          score += shape * this['level' + this.level][2];
        }
        /*if (speed > 0){ score += speed * this["level" +this .level[3]];}*/
        this.incScore(score);
      },
      checkScore: function () {
        if (this.score >= this['level' + this.level][0]) {
          this.incLevel();
        }
      },
      gameOver: function () {
        this.clearTimers();
        isStart = false;
        this.canvas.innerHTML = '<h1>GAME OVER</h1>';
      },
      play: function () {
        let me = this;
        if (this.timer === null) {
          this.initTimer();
        }
        let gameLoop = function () {
          me.move('D');
          if (me.curComplete) {
            me.markBoardShape(me.curX, me.curY, me.curShape);
            me.curSqs.eachdo(function () {
              me.sqs.push(this);
            });
            me.calcScore({ shape: true });
            me.checkRows();
            me.checkScore();
            me.initShapes();
            me.play();
          } else {
            me.pTimer = setTimeout(gameLoop, me.speed);
          }
        };
        this.pTimer = setTimeout(gameLoop, me.speed);
        this.isActive = 1;
      },
      togglePause: function () {
        if (this.isActive === 1) {
          this.clearTimers();
          this.isActive = 0;
        } else {
          this.play();
        }
      },
      clearTimers: function () {
        clearTimeout(this.timer);
        clearTimeout(this.pTimer);
        this.timer = null;
        this.pTimer = null;
      },
      move: function (dir) {
        let s = '';
        let me = this;
        let tempX = this.curX;
        let tempY = this.curY;
        switch (dir) {
          case 'L':
            s = 'left';
            tempX -= 1;
            break;
          case 'R':
            s = 'left';
            tempX += 1;
            break;
          case 'D':
            s = 'top';
            tempY += 1;
            break;
          case 'RT':
            this.rotate();
            return true;
            break;
          default:
            throw new Error('wtf');
            break;
        }
        if (this.checkMove(tempX, tempY, this.curShape)) {
          this.curSqs.eachdo(function (i) {
            let l = parseInt(this.style[s], 10);
            dir === 'L' ? (l -= me.pSize) : (l += me.pSize);
            this.style[s] = l + 'px';
          });
          this.curX = tempX;
          this.curY = tempY;
        } else if (dir === 'D') {
          if (this.curY === 1 || this.time === this.maxTime) {
            this.gameOver();
            return false;
          }
          this.curComplete = true;
        }
      },
      rotate: function () {
        if (this.curShapeIndex !== 6) {
          //square
          let temp = [];
          this.curShape.eachdo(function () {
            temp.push([this[1] * -1, this[0]]);
          });
          if (this.checkMove(this.curX, this.curY, temp)) {
            this.curShape = temp;
            this.removeCur();
            this.drawShape(this.curX, this.curY, this.curShape);
          } else {
            throw new Error('Could not rotate!');
          }
        }
      },
      checkMove: function (x, y, p) {
        if (this.isOB(x, y, p) || this.isCollision(x, y, p)) {
          return false;
        }
        return true;
      },
      isCollision: function (x, y, p) {
        let me = this;
        let bool = false;
        p.eachdo(function () {
          let newX = this[0] + x;
          let newY = this[1] + y;
          if (me.boardPos(newX, newY) === 1) {
            bool = true;
          }
        });
        return bool;
      },
      isOB: function (x, y, p) {
        let w = this.boardWidth - 1;
        let h = this.boardHeight - 1;
        let bool = false;
        p.eachdo(function () {
          let newX = this[0] + x;
          let newY = this[1] + y;
          if (newX < 0 || newX > w || newY < 0 || newY > h) {
            bool = true;
          }
        });
        return bool;
      },
      getRowState: function (y) {
        let c = 0;
        for (let x = 0; x < this.boardWidth; x++) {
          if (this.boardPos(x, y) === 1) {
            c = c + 1;
          }
        }
        if (c === 0) {
          return 'E';
        }
        if (c === this.boardWidth) {
          return 'F';
        }
        return 'U';
      },
      checkRows: function () {
        let me = this;
        let start = this.boardHeight;
        this.curShape.eachdo(function () {
          let n = this[1] + me.curY;
          console.log(n);
          if (n < start) {
            start = n;
          }
        });
        console.log(start);
  
        let c = 0;
        let stopCheck = false;
        for (let y = this.boardHeight - 1; y >= 0; y--) {
          switch (this.getRowState(y)) {
            case 'F':
              this.removeRow(y);
              c++;
              break;
            case 'E':
              if (c === 0) {
                stopCheck = true;
              }
              break;
            case 'U':
              if (c > 0) {
                this.shiftRow(y, c);
              }
              break;
            default:
              break;
          }
          if (stopCheck === true) {
            break;
          }
        }
        if (c > 0) {
          this.calcScore({ lines: c });
        }
      },
      shiftRow: function (y, amount) {
        let me = this;
        for (let x = 0; x < this.boardWidth; x++) {
          this.sqs.eachdo(function () {
            if (me.isAt(x, y, this)) {
              me.setBlock(x, y + amount, this);
            }
          });
        }
        me.emptyBoardRow(y);
      },
      emptyBoardRow: function (y) {
        for (let x = 0; x < this.boardWidth; x++) {
          this.markBoardAt(x, y, 0);
        }
      },
      removeRow: function (y) {
        for (let x = 0; x < this.boardWidth; x++) {
          this.removeBlock(x, y);
        }
      },
      removeBlock: function (x, y) {
        let me = this;
        this.markBoardAt(x, y, 0);
        this.sqs.eachdo(function (i) {
          if (me.getPos(this)[0] === x && me.getPos(this)[1] === y) {
            me.canvas.removeChild(this);
            me.sqs.splice(i, 1);
          }
        });
      },
      setBlock: function (x, y, block) {
        this.markBoardAt(x, y, 1);
        let newX = x * this.pSize;
        let newY = y * this.pSize;
        block.style.left = newX + 'px';
        block.style.top = newY + 'px';
      },
      isAt: function (x, y, block) {
        if (this.getPos(block)[0] === x && this.getPos(block)[1] === y) {
          return true;
        }
        return false;
      },
      getPos: function (block) {
        let p = [];
        p.push(parseInt(block.style.left, 10) / this.pSize);
        p.push(parseInt(block.style.top, 10) / this.pSize);
        return p;
      },
      getBoardIdx: function (x, y) {
        return x + y * this.boardWidth;
      },
      boardPos: function (x, y) {
        return this.board[x + y * this.boardWidth];
      },
      markBoardAt: function (x, y, val) {
        this.board[this.getBoardIdx(x, y)] = val;
      },
      markBoardShape: function (x, y, p) {
        let me = this;
        p.eachdo(function (i) {
          let newX = p[i][0] + x;
          let newY = p[i][1] + y;
          me.markBoardAt(newX, newY, 1);
        });
      },
      isIE: function () {
        return this.bTest(/IE/);
      },
      isFirefox: function () {
        return this.bTest(/Firefox/);
      },
      isSafari: function () {
        return this.bTest(/Safari/);
      },
      bTest: function (rgx) {
        return rgx.test(navigator.userAgent);
      },
    };
    const btn = document.querySelector('#start');
    btn.addEventListener('click', function () {
      btn.style.display = 'none';
      if (!isStart) {
        tetris.init();
      }
    });
  })();
  
  if (!Array.prototype.eachdo) {
    Array.prototype.eachdo = function (fn) {
      for (let i = 0; i < this.length; i++) {
        fn.call(this[i], i);
      }
    };
  }
  if (!Array.prototype.remDup) {
    Array.prototype.remDup = function () {
      let temp = [];
      for (let i = 0; i < this.length; i++) {
        let bool = true;
        for (let j = i + 1; j < this.length; j++) {
          if (this[i] === this[j]) {
            bool = false;
          }
        }
        if (bool === true) {
          temp.push(this[i]);
        }
      }
      return temp;
    };
  }