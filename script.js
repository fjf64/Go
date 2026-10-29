var symbols = ['0', 'X', '&nbsp;'] // none, p1, p2
var boardStats = {
    size:5
}
var board = []
var currentPlayer = 1

function createBoard(boardsize = 5, location = "board") {

  //frontend
  var tbl = document.createElement('table')
  tbl.id = 'table'
  var idCounterY = 0
  for (let i = 0; i < boardsize; i++) {
    var idCounterX = 0
    var tr = tbl.insertRow()
    for (let ii = 0; ii < boardsize; ii++) {
      let td = tr.insertCell();
      td.innerHTML = symbols[2]
      td.id = "cell-"+idCounterX+"-"+idCounterY
      td.addEventListener("click", function(){playerMove(td.id)});
      idCounterX++
    }
    idCounterY++
  }
  // console.log(document.getElementById(location))
  // document.getElementById(location).firstChild.remove()
  document.getElementById(location).appendChild(tbl)

  //backend
  var board = []
  for (let i = 0; i < boardsize; i++) {
    var boardLane = []
    for (let ii = 0; ii < boardsize; ii++) {
      boardLane.push([symbols[2]])
    }
    board.push(boardLane)
  }
  return board

}
function getValidMoves() {

}

function playMove(board, x, y, player) {
  board[y][x] = player
  document.getElementById('table').children[0].children[y].children[x].innerHTML = player
}


function startGame() {
  board = createBoard(5)
  currentPlayer = 1
  nextMove()

}

function playerMove(cellID) {
  if (currentPlayer == 0 && document.getElementById("p1").checked || currentPlayer == 1 && document.getElementById("p2").checked) {
  cellID = cellID.split("-")  
  console.log(currentPlayer) 
  playMove(board, parseInt(cellID[1]),parseInt(cellID[2]), symbols[currentPlayer])
  }
  nextMove()
}
function nextMove() {
  currentPlayer == 1 ? currentPlayer = 0 : currentPlayer = 1
  console.log(currentPlayer)
  if (currentPlayer == 0 && !document.getElementById("p1").checked){

  } else if (currentPlayer == 1 && !document.getElementById("p1").checked) {

  }
}


function checkAdjacent(board, x, y) { //WIP
  adjecentAdjustment = [
    [0,-1],
    [0,1],
    [-1,0],
    [1,0]
  ]
  for (let i of adjecentAdjustment) {
    for (let ii = 0; ii < boardsize; ii++) {
    }
  }
}


startGame()