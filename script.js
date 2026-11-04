var symbols = ['0', 'X', '&nbsp;'] // none, p1, p2
var inverseSymbols = {
  '0': 0,
  'X': 1,
  '&nbsp;': 2
} // none, p1, p2
var boardStats = {
  size: 5
}
var board = []
var currentPlayer = 1
var lastPlay = []

function includesDeep(array, value) {
  return array.some((subArray) => {
    return subArray.every(
      (subArrayElem, index) => subArrayElem === value[index]
    );
  });
}

function createBoard(boardsize = boardStats.size, location = "board") {

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
      td.id = "cell-" + idCounterX + "-" + idCounterY
      td.addEventListener("click", function () { playerMove(td.id) });
      idCounterX++
    }
    idCounterY++
  }
  document.getElementById(location).firstChild.remove()
  document.getElementById(location).appendChild(tbl)

  //backend
  var board = []
  for (let i = 0; i < boardsize; i++) {
    var boardLane = []
    for (let ii = 0; ii < boardsize; ii++) {
      boardLane.push(symbols[2])
    }
    board.push(boardLane)
  }
  return board

}
function checkValidity(board, x, y, player) {
  if (board[x][y] == symbols[2]) {
    var willCapture = false
    var fakeBoard = JSON.parse(JSON.stringify(board))
    fakeBoard[x][y] = player
    for (let i of getAdjacent(fakeBoard, x, y)) {
      if (i[2] == symbols[2]) {
        continue
      }
      var chainLiberties = getChainLiberties(fakeBoard, i[0], i[1], i[2])
      if (chainLiberties.length < 1) {
        willCapture = true
      }
    }

    if (getChainLiberties(board, x, y, player).length > 0 || willCapture) { //or will capture opponent
      return true
    } else {
      return false
    }
  } {
    return false
  }
}

function playMove(board, x, y, player, playerMade = true) {
  board[x][y] = player
  document.getElementById('table').children[0].children[y].children[x].innerHTML = player
  if (playerMade) {
    lastPlay = [x, y, player]
  }
}

function playerMove(cellID) {
  if (currentPlayer == 0 && document.getElementById("p1").checked || currentPlayer == 1 && document.getElementById("p2").checked) {
    cellID = cellID.split("-")
    cellID = [cellID[0], parseInt(cellID[1]), parseInt(cellID[2])]
    if (checkValidity(board, cellID[1], cellID[2], symbols[currentPlayer])) {
      playMove(board, cellID[1], cellID[2], symbols[currentPlayer])
      nextTurn()
    }
  }
}

function passTurn() {
  //WIP, use button for player
}

function nextTurn() {
  currentPlayer == 1 ? currentPlayer = 0 : currentPlayer = 1

  // game logic here
  for (let i of getAdjacent(board, lastPlay[0], lastPlay[1])) {
    if (i[2] == symbols[2]) {
      continue
    }
    var chainLiberties = getChainLiberties(board, i[0], i[1], i[2])
    var chain = getChain(board, i[0], i[1], i[2])
    console.log(chain)
    if (chainLiberties.length < 1) { // No libs
      playMove(board, i[0], i[1], symbols[2], false)
      for (let ii of chain) {
        playMove(board, ii[0], ii[1], symbols[2], false)
      }
    }
  }

  //ai moves
  if (currentPlayer == 0 && !document.getElementById("p1").checked) {
    //runai(0)
  } else if (currentPlayer == 1 && !document.getElementById("p1").checked) {
    //runai(1)
  }
}
function getOpenSpaces(board, x, y) {
  libs = []
  for (let i of getAdjacent(board, x, y)) {
    if (i[2] == symbols[2]) {
      libs.push(i)
    }
  }
  return libs
}
function getLiberties(board, x, y, player) {
  libs = []
  for (let i of getAdjacent(board, x, y)) {
    if (i[2] == player || i[2] == symbols[2]) {
      libs.push(i)
    }
  }
  return libs
}

function getChain(board, x, y, player) {
  var chain = []
  // add self
  chain.push([x, y, player])
  var i = 0
  while (i < chain.length && chain[i] !== undefined) {
    var adjs = getAdjacent(board, chain[i][0], chain[i][1], 1, player)
    for (let singAdj of adjs) {
      if (singAdj[2] == player && !includesDeep(chain, singAdj)) {
        chain.push(singAdj)

      }
    }
    i += 1
  }
  return chain
}

function getChainLiberties(board, x, y, player) {
  var chain = getChain(board, x, y, player)
  var liberties = []
  for (let links of chain) {
    for (let lib of getOpenSpaces(board, links[0], links[1], player))
      if (lib[2] == symbols[2]) {
        liberties.push(lib)
      }
  }
  return liberties
}

function getAdjacent(board, x, y) { //WIP
  adjecentAdjustment = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0]
  ]
  returnal = []
  for (let i of adjecentAdjustment) {
    if (board[x + i[0]] && board[x + i[0]][y + i[1]])
      returnal.push([x + i[0], y + i[1], board[x + i[0]][y + i[1]]])
  }
  return returnal
}

function startGame() {
  board = createBoard(boardStats.size)
  currentPlayer = 1
  lastPlay = []
  nextTurn()

}


startGame()