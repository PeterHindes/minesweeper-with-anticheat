function generate(gameState) {
   // This function generates an html table with a minesweeper board
   // we are passed an array which consists of 0: untouched, 1: flagged, 2: revealed, 3: blown up, 4: revealed bomb (end of game)
   // retunrs an html table with our board using divs with class matching their state
   // in a service worker we can't use document.createElement
   // so we have to use string manipulation
   let board = gameOver ? "<h1>GameOver</h1><table>" : "<table>";
   for (let j = 0; j < scale; j++) {
      board += "<tr>";
      for (let i = 0; i < scale; i++) {
         let cell = gameState[i + j * scale];
         let cellClass = "";
         if (cell == 0) {
            cellClass = "untouched";
         } else if (cell == 1) {
            cellClass = "flagged";
         } else if (cell == 2) {
            cellClass = "revealed";
         } else if (cell == 3) {
            cellClass = "blown";
         } else if (cell == 4) {
            cellClass = "revealedBomb";
         }
         board += `<td debug-index="${i+j*scale}" class="${cellClass} cell" ${ gameOver ? '' : `hx-post="/api/${flagging ? 'flag' : 'mark'}?x=${i}&y=${j}" hx-trigger="click"  hx-target="#theBoard" hx-swap="innerHtml"` } >${boardValues[i+j*scale]}</td>`;
      }
      board += "</tr>";
   }
   board += "</table>";
   return board;
}

const scale = 10;
const density = 0.2;
let minefield;
let boardValues;
let gameState;
let flagging ;
let firstMove;
let gameOver ;

function newGame() {
   minefield = new Array((scale*scale)).fill(0);
   console.log("minefield", minefield);
   // set some random mines
   for (let i = 0; i < ((scale*scale)*density); i++) {
      minefield[Math.floor(Math.random() * scale*scale)] = 1;
   }
   boardValues = new Array(scale*scale).fill(0);
   for (let j = 0; j < scale; j++) {
      for (let i = 0; i < scale; i++) {
         let count = 0;
         console.log("ij",i, j);
         const inx = i+j*scale;
         if (minefield[inx] == 1) {
            boardValues [inx] = -1;
         } else {
            for (let l = (j == 0 ? 0 : -1); l <= (j == scale-1 ? 0 : 1); l++) {
               for (let k = (i == 0 ? 0 : -1); k <= (i == scale-1 ? 0 : 1); k++) {
                  if (!(k == 0 && l == 0)) {
                     const nix = (i + k) + (j + l) * scale;
                     console.log("nix", nix, "explosive", minefield[nix]);
                     count += minefield[nix];
                  }
               }
            }
            boardValues[i + j * scale] = count;
         }
      }
   }
   gameState = new Array(100).fill(0);
   flagging = false;
   firstMove = true;
   gameOver = false;
}
newGame();

console.log("worker loaded");
console.log("gameState", gameState);

function handlePlayer(url) {
   console.log("fetching", url);
   const mark = new RegExp('\/api\/mark');
   const flag = new RegExp('\/api\/flag');
   if (url.endsWith('/api/newGame')) {
      newGame();
      return generate(gameState);
   } else if (url.endsWith('/api/board')) {
      flagging = false;
      return generate(gameState);
   } else if (url.endsWith('/api/boardFlag')){
      flagging = true;
      return generate(gameState);
   } else if (mark.test(url)) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const x = urlParams.get("x");
      const y = urlParams.get("y");
      const index = parseInt(x) + parseInt(y) * 10;
      console.log(minefield[index] == 1 ? "BOOM" : "SAFE");
      if (minefield[index] == 1) {
         if (firstMove) {
            minefield[index] = 0;
            gameState[index] = 2;
         } else {
            gameOver = true;
            for (let i = 0; i < 100; i++) {
               if (minefield[i] == 1) {
                  gameState[i] = 4;
               }
            }
            gameState[index] = 3;
         }
      } else {
         gameState[index] = 2;
      }
      firstMove = false;
      return generate(gameState);
   } else if (flag.test(url)) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const x = urlParams.get("x");
      const y = urlParams.get("y");
      const index = parseInt(x) + parseInt(y) * 10;
      gameState[index] = gameState[index] == 2 ? 2 : 1;
      firstMove = false;
      return generate(gameState);
   }
}

export { handlePlayer };