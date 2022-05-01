const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');
const gameSt = document.querySelector('#game-status');
const dfsRes = document.getElementById('dfs');
const bfsRes = document.getElementById('bfs');
const ucsRes = document.getElementById('ucs');

const POWER_PILL_TIME = 10000; 
const GLOBAL_SPEED = 80; 

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const DIRECTIONS = {
  ArrowLeft: {
    code: 37,
    movement: -1,
    rotation: 180
  },
  ArrowUp: {
    code: 38,
    movement: -GRID_SIZE,
    rotation: 270
  },
  ArrowRight: {
    code: 39,
    movement: 1,
    rotation: 0
  },
  ArrowDown: {
    code: 40,
    movement: GRID_SIZE,
    rotation: 90
  }
};

const OBJECT_TYPE = {
  BLANK: 'blank',
  WALL: 'wall',
  DOT: 'dot',
  BLINKY: 'blinky',
  PINKY: 'pinky',
  INKY: 'inky',
  CLYDE: 'clyde',
  PILL: 'pill',
  PACMAN: 'pacman',
  GHOST: 'ghost',
  SCARED: 'scared',
  GHOSTLAIR: 'lair',
  FRUIT: 'fruit',
  PATH: 'path',
};


const CLASS_LIST = [
  OBJECT_TYPE.BLANK,
  OBJECT_TYPE.WALL,
  OBJECT_TYPE.DOT,
  OBJECT_TYPE.BLINKY,
  OBJECT_TYPE.PINKY,
  OBJECT_TYPE.INKY,
  OBJECT_TYPE.CLYDE,
  OBJECT_TYPE.PILL,
  OBJECT_TYPE.PACMAN,
  OBJECT_TYPE.GHOSTLAIR,
  OBJECT_TYPE.FRUIT,
  OBJECT_TYPE.PATH,
];


const LEVEL = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1,
  1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1,
  1, 7, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 7, 1,
  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
  1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1,
  1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1,
  1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1,
  1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1,
  1, 1, 1, 1, 2, 1, 2, 1, 9, 9, 9, 9, 1, 2, 1, 2, 1, 1, 1, 1,
  1, 1, 1, 1, 2, 1, 2, 1, 9, 9, 9, 9, 1, 2, 1, 2, 1, 1, 1, 1, 
  1, 0, 0, 0, 2, 2, 2, 1, 9, 9, 9, 9, 1, 2, 2, 2, 0, 0, 0, 1, 
  1, 1, 1, 1, 2, 1, 2, 1, 9, 9, 9, 9, 1, 2, 1, 2, 1, 1, 1, 1, 
  1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1,
  1, 1, 1, 1, 2, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 1, 1, 1,
  1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1,
  1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1,
  1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1,
  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
  1, 7, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 7, 1,
  1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1,
  1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];



class GameBoard {
    constructor(DOMGrid) {
      this.dotCount = 0;
      this.grid = [];
      this.DOMGrid = DOMGrid;
    }
  
    showGameStatus(gameWin) {
      const div = document.getElementById('game-status');
      div.innerHTML = '';
      div.innerHTML = `${gameWin ? 'WIN!' : 'GAME OVER!'}`;
    }
  
    createGrid(level) {
      this.dotCount = 0;
      this.grid = [];
      this.DOMGrid.innerHTML = '';
      this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

      let id = 0;
  
      level.forEach((square) => {
        const div = document.createElement('div');
        div.classList.add('square', CLASS_LIST[square]);
        div.id = id;
        div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
        this.DOMGrid.appendChild(div);
        this.grid.push(div);
        id++;
        if (CLASS_LIST[square] === OBJECT_TYPE.DOT) this.dotCount++;
      });
    }
  
    addObject(pos, classes) {
      this.grid[pos].classList.add(...classes);
    }
  
    removeObject(pos, classes) {
      this.grid[pos].classList.remove(...classes);
    }

    objectExist(pos, object) {
      return this.grid[pos].classList.contains(object);
    };
  
    rotateDiv(pos, deg) {
      this.grid[pos].style.transform = `rotate(${deg}deg)`;
    }
  
    moveCharacter(character) {
      if (character.shouldMove()) {
        const { nextMovePos, direction } = character.getNextMove(
          this.objectExist.bind(this)
        );
        const { classesToRemove, classesToAdd } = character.makeMove();
  
        if (character.rotation && nextMovePos !== character.pos) {
          this.rotateDiv(nextMovePos, character.dir.rotation);
          this.rotateDiv(character.pos, 0);
        }
  
        this.removeObject(character.pos, classesToRemove);
        this.addObject(nextMovePos, classesToAdd);
  
        character.setNewPos(nextMovePos, direction);
      }
    }

    getCoords(num) {
      let cy =  Math.floor(num / CELL_SIZE);
      let cx = num % 10;

      let cur = Math.floor((num / 10) % 10);
      if (cur == 3 || cur == 7 || cur == 9 || cur == 1 || cur == 5){
        cx += 10
      } 

      if (cx == 0){
        cx = 10;
      }

      return [cy, cx];
      
    }
  
    static createGameBoard(DOMGrid, level) {
      const board = new this(DOMGrid);
      board.createGrid(level);
      return board;
    }
}


const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);


class Pacman {
  constructor(speed, startPos) {
    this.pos = startPos;
    this.speed = speed;
    this.dir = null;
    this.timer = 0;
    this.powerPill = false;
    this.rotation = true;
  }
  
  shouldMove() {
    if (!this.dir) return;
  
    if (this.timer === this.speed) {
      this.timer = 0;
      return true;
    }
    this.timer++;
  }
  
  getNextMove(objectExist) {
    let nextMovePos = this.pos + this.dir.movement;

    if (
      objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
      objectExist(nextMovePos, OBJECT_TYPE.GHOSTLAIR)
    ) {
      nextMovePos = this.pos;
    }
  
    return { nextMovePos, direction: this.dir };
  }
  
  makeMove() {
    const classesToRemove = [OBJECT_TYPE.PACMAN];
    const classesToAdd = [OBJECT_TYPE.PACMAN];
  
    return { classesToRemove, classesToAdd };
  }
  
  setNewPos(nextMovePos) {
    this.pos = nextMovePos;
  }

  curPos() {
      return this.pos;
  }
  
  handleKeyInput = (e, objectExist) => {
    let dir;
  
    if (e.keyCode >= 37 && e.keyCode <= 40) {
      dir = DIRECTIONS[e.key];
    } else {
      return;
    }
  
    const nextMovePos = this.pos + dir.movement;
    if (objectExist(nextMovePos, OBJECT_TYPE.WALL)) return;
    this.dir = dir;
  };
}


class Ghost {
  constructor(speed = 5, startPos, movement, name) {
    this.name = name;
    this.movement = movement;
    this.startPos = startPos;
    this.pos = startPos;
    this.dir = DIRECTIONS.ArrowRight;
    this.speed = speed;
    this.timer = 0;
    this.isScared = false;
    this.rotation = false;
  }
  
  shouldMove() {
    if (this.timer === this.speed) {
      this.timer = 0;
      return true;
    }
    this.timer++;
  }
  
  getNextMove(objectExist) {
    const { nextMovePos, direction } = this.movement(
      this.pos,
      this.dir,
      objectExist
    );
    return { nextMovePos, direction };
  }
  
  makeMove() {
    const classesToRemove = [OBJECT_TYPE.GHOST, OBJECT_TYPE.SCARED, this.name];
    let classesToAdd = [OBJECT_TYPE.GHOST, this.name];
  
    if (this.isScared) classesToAdd = [...classesToAdd, OBJECT_TYPE.SCARED];
  
    return { classesToRemove, classesToAdd };
  }
  
  setNewPos(nextMovePos, direction) {
    this.pos = nextMovePos;
    this.dir = direction;
  }

}

function prepareMatrix(array) {

  for( let i = 0; i < array.length; i++){
      if(array[i] == 2 || array[i] == 7){
        array[i] = 0;
      }

      if(array[i] == 9){
        array[i] = 1;
      }
  }
  
  let size = 20; 
  let matrix = []; 
  
  for (let i = 0; i <Math.ceil(array.length/size); i++){
    matrix[i] = array.slice((i*size), (i*size) + size);
  }

  return matrix;

}


let arrCoords = [];
for(let i = 0; i < 460; i++){
    arrCoords.push(i);
}


let availCoords = [];
for(let i = 0; i < LEVEL.length; i++){
    if(LEVEL[i] == 2) {
        availCoords.push(arrCoords[i]);
    }
}

class Fruit {
  constructor(pos) {
    this.pos = pos;
  }

  curPos(){
    return this.pos;
  }

  setNewPos(){
    let rand = Math.floor(Math.random()*availCoords.length);
    this.pos = availCoords[rand];
    gameBoard.addObject(this.pos, [OBJECT_TYPE.FRUIT]);
    gameBoard.removeObject(this.pos, [OBJECT_TYPE.PILL]);
    gameBoard.removeObject(this.pos, [OBJECT_TYPE.DOT]);
  }


}


class QElement {
  constructor(priority, element, p)
  {
      this.priority = priority;
      this.element = element;
      this.p = p;
  }
}

class PriorityQueue {

  constructor()
  {
      this.items = [];
  }

  enqueue(priority, element, p){
      let qElement = new QElement(priority, element, p);
      let contain = false;
      
      for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].priority > qElement.priority) {
          this.items.splice(i, 0, qElement);
          contain = true;
          break;
          }
      }

      if (!contain) {
         this.items.push(qElement);
      }
  } 

  getQueue() {
      let prio, elem, q;
      for (let i = 0; i < this.items.length; i++){
          prio = this.items[i].priority;
          elem = this.items[i].element;
          q = this.items[i].p;
      }

      return [prio, elem, q];
  }

  isEmpty(){
     return this.items.length == 0;
  }

  dequeue(x){
     this.items.splice(-1, x-1).pop();
  }

}


// game control

function checkCollision(pacman, ghosts) {
  const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);
  if (collidedGhost) {
    if (pacman.powerPill) {
      gameBoard.removeObject(collidedGhost.pos, [
        OBJECT_TYPE.GHOST,
        OBJECT_TYPE.SCARED,
        collidedGhost.name
      ]);
      collidedGhost.pos = collidedGhost.startPos;
      score += 100;
    } else {
      gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
      gameBoard.rotateDiv(pacman.pos, 0);
      gameOver(pacman);
    }
  }
}


function getNeighbors(matrix, current_coord) {
  let [cy, cx] = current_coord;
  let nodes = [[cy-1, cx], [cy, cx+1], [cy+1, cx], [cy, cx-1]];
  let neighboring_nodes = [];

  for(let i = 0; i < nodes.length; i++){
      if(matrix[nodes[i][0]][nodes[i][1]] !== 1){
          neighboring_nodes.push(nodes[i]);
      }
  }

  return neighboring_nodes;
}


function getPath(parents, coord) {
  let arr = [];
  let current = coord;

  while(current != null) {
      arr.unshift(current);
      current = parents[current];
  }

  return arr;
}


function bfs(matrix, start_coord, finish_coord) {
  let queue = [start_coord];
  let parents = {[start_coord] : null};

  while (queue.length > 0) {
      current_coord = queue.shift(0);

      if(current_coord[0] == finish_coord[0] && current_coord[1] == finish_coord[1]){
          return getPath(parents, finish_coord)
      }      

      let neighboring_nodes = getNeighbors(matrix, current_coord);

      for(let i=0; i < neighboring_nodes.length; i++){
          if(!(neighboring_nodes[i] in parents)){
              parents[neighboring_nodes[i]] = current_coord;
              queue.push(neighboring_nodes[i]);
          }

      }

  }

}


function dfs (matrix, start_coord, finish_coord) {
  let stack = [start_coord];
  let result = [];

  let visited = matrix.map(function (item) {
      return [...item]
  })

  for(let i = 0; i < visited.length; i++){
      for(let j=0; j < visited.length; j++){
          visited[i][j] = false;
      }
  }

  while (stack.length > 0) {
     let current_coord = stack[stack.length - 1];
     result.push(current_coord);

     if(current_coord[0] == finish_coord[0] && current_coord[1] == finish_coord[1]){
         console.log(result);
         return result;
     } 

     let [cy, cx] = current_coord;
     visited[cy][cx] = true;

     let neighbNodes = getNeighbors(matrix, current_coord);
     let neighboring_nodes = [];

     for(let i=0; i < neighbNodes.length; i++){
         if(visited[neighbNodes[i][0]][neighbNodes[i][1]] == false){
            neighboring_nodes.push(neighbNodes[i]);
         }
     }

     stack.push(...neighboring_nodes);

     if(neighboring_nodes.length == 0){
         stack.pop();
         result.pop();
     }
      
  }
}


function ucs(matrix, start_coord, finish_coord) {

  let visited = matrix.map(function (item) {
      return [...item]
  })

  for(let i = 0; i < visited.length; i++){
      for(let j=0; j < visited.length; j++){
          visited[i][j] = false;
      }
  }

  let priorityQueue = new PriorityQueue();
  priorityQueue.enqueue(0, start_coord, [start_coord]);


  while(!priorityQueue.isEmpty()) {
      let [cost, current_coord, path] = priorityQueue.getQueue();


      visited[current_coord[0]][current_coord[1]] = true;

      if (current_coord[0] == finish_coord[0] && current_coord[1] == finish_coord[1]){
          return path;
      } 

      let neighboring_nodes = getNeighbors(matrix, current_coord);

      priorityQueue.dequeue(2);

      for(let i=0; i < neighboring_nodes.length; i++){
          let node = neighboring_nodes[i];
          if(visited[node[0]][node[1]] === false) {
              visited[node[0]][node[1]] = true;
              priorityQueue.enqueue(cost+1, node, path.concat([node]))
          }
      }

  }
}


let queL = [];

function showPath(nodesPos, level) {

  queL.push(nodesPos);

  let pth = [];
  let size = 20; 

  for(let i = 1; i < level.length; i++){
    pth[i] = document.getElementById(i);
  }

  let matrx = []; 
  
  for (let i = 0; i <Math.ceil(pth.length/size); i++){
    matrx[i] = pth.slice((i*size), (i*size) + size);
  }

  if(queL.length > 1){
    if(queL[queL.length - 1].length != queL[queL.length - 2].length){
      for(let i = 0; i < queL.length; i++){
        let queu = queL[i];
        for(let j = 0; j < queu.length-1; j++){
          let node = queu[j];
          matrx[node[0]][node[1]].classList.remove(OBJECT_TYPE.PATH);
        }
      }
    }
  }

  for(let i = 1; i < nodesPos.length-1; i++){
    let node = nodesPos[i];
    matrx[node[0]][node[1]].classList.add(OBJECT_TYPE.PATH);
  }

}


function gameLoop(pacman, ghosts, fruit) {

  gameBoard.moveCharacter(pacman);

  checkCollision(pacman, ghosts);

  ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));

  checkCollision(pacman, ghosts);

  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
    gameBoard.dotCount--;
    score += 10;
  }

  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);
    pacman.powerPill = true;
    score += 50;
    powerPillTimer = setTimeout(
      () => (pacman.powerPill = false),
      POWER_PILL_TIME
    );
  }

  let start, finish;
  
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.FRUIT)) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.FRUIT]);
    fruit.setNewPos();
    gameBoard.addObject(fruit.pos, [OBJECT_TYPE.FRUIT]);
    gameBoard.removeObject(fruit.pos, [OBJECT_TYPE.PILL]);
    gameBoard.removeObject(fruit.pos, [OBJECT_TYPE.DOT]);
    score += 100;
  }

  start = gameBoard.getCoords(pacman.pos);
  finish = gameBoard.getCoords(fruit.pos);

  let newLevel = LEVEL.slice(0);

  let matrix = prepareMatrix(newLevel);

  let time = performance.now();
  let pt = bfs(matrix, start, finish);
  let time2 = performance.now();
  bfsRes.innerText = `BFS: ${time2 - time}`;

  let time3 = performance.now();
  let pt1 = dfs(matrix, start, finish);
  let time4 = performance.now();
  dfsRes.innerText = `DFS: ${time4 - time3}`;

  let time5 = performance.now();
  let pt2 = bfs(matrix, start, finish);
  let time6 = performance.now();
  ucsRes.innerText = `UCS: ${time6 - time5}`;

  showPath(pt, newLevel);

  if (pacman.powerPill !== powerPillActive) {
    powerPillActive = pacman.powerPill;
    ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
  }

  if (gameBoard.dotCount === 0) {
    gameWin = true;
    gameOver(pacman);
  }

  scoreTable.innerHTML = score;

}


// ghost's functions
function randomMovement(position, direction, objectExist) {
  let dir = direction;
  let nextMovePos = position + dir.movement;

  const keys = Object.keys(DIRECTIONS);
  
  while (
    objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
    objectExist(nextMovePos, OBJECT_TYPE.GHOST)
  ) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    dir = DIRECTIONS[key];
    nextMovePos = position + dir.movement;
  }
  
  return { nextMovePos, direction: dir };
}
  

// start and end 

function startGame() {
  gameWin = false;
  powerPillActive = false;
  fruitExist = false;
  score = 0;

  gameSt.innerHTML = " ";
  
  startButton.classList.add('hide');
  scoreTable.style.display = 'flex';
  
  gameBoard.createGrid(LEVEL);
  
  const pacman = new Pacman(2, 287);
  gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);

  let fruit = new Fruit(375);
  gameBoard.addObject(fruit.pos, [OBJECT_TYPE.FRUIT]);
  gameBoard.removeObject(fruit.pos, [OBJECT_TYPE.PILL]);
  gameBoard.removeObject(fruit.pos, [OBJECT_TYPE.DOT]);

  document.addEventListener('keydown', (e) =>
  pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  const ghosts = [
    new Ghost(2, 188, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(3, 209, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(4, 230, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(5, 251, randomMovement, OBJECT_TYPE.CLYDE)
  ];

  timer = setInterval(() => gameLoop(pacman, ghosts, fruit), GLOBAL_SPEED);

}


function gameOver(pacman) {
  
  document.removeEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );
  
  gameBoard.showGameStatus(gameWin);
  
  clearInterval(timer);

  startButton.classList.remove('hide');
  scoreTable.style.display = 'none';
}


startButton.addEventListener('click', startGame)





