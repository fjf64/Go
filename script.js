// todo: rule 7 double back, two passes end game, 
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
var straightBoard = []
var currentPlayer = 1
var lastPlay = []
editedPlayerIcon = false

function includesDeep(array, value) {
  return array.some((subArray) => {
    return subArray.every(
      (subArrayElem, index) => subArrayElem === value[index]
    );
  });
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function flashElement(element, effect, ogColor, newColor, time = 500, count = 1) {
  //effect in path list
  poppedEffect = JSON.parse(JSON.stringify(effect));
  var target = element;
  poppedEffect.pop();
  for (let x of poppedEffect) {
    target = target[x];
  }
  i = 0;
  while (i < count) {
    target[effect[effect.length - 1]] = newColor;
    await sleep(time);
    target[effect[effect.length - 1]] = ogColor;
    await sleep(time);
    i++;
  }
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

function getStraightBoard(board) {
  var newBoard = []
  for (let i in board) {
    for (let ii in board[i]) { //every tile
      newBoard.push([parseInt(i), parseInt(ii), board[i][ii]])
    }
  }
  return newBoard
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
      if (chainLiberties.length < 1 && i[2] !== player) {
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
  straightBoard = getStraightBoard(board)
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

function getCapturedLand(board, player) { //wip
  capturedLand = []
  for (let i in board) {
    for (let ii in board[i]) { //every tile

    }
  }
  return capturedLand
}

function passTurn() {
  nextTurn()
}

function nextTurn() {
  currentPlayer == 1 ? currentPlayer = 0 : currentPlayer = 1
  if (editedPlayerIcon == false) {
    document.getElementById("playerIcon").innerHTML = "Player: " + symbols[currentPlayer]
  } else {
    editedPlayerIcon = false
  }
  // GAME LOGIC
  lastPlayAdjacent = getAdjacent(board, lastPlay[0], lastPlay[1])

  // Sort to prevent self-capture before capture
  sortedAjdacent = []
  for (let i of lastPlayAdjacent) {
    if (i[2] == lastPlay[2]) {
      sortedAjdacent.push(i)
    } else if (i[2] == (lastPlay[2] == symbols[1] ? symbols[0] : symbols[1])) {
      sortedAjdacent.unshift(i)
    }
  }
  for (let i of sortedAjdacent) {
    if (i[2] == symbols[2]) {
      continue
    }
    var chainLiberties = getChainLiberties(board, i[0], i[1], i[2])
    var chain = getChain(board, i[0], i[1], i[2])
    if (chainLiberties.length < 1) { // No libs
      //append
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
function getSpaces(board, x, y, sym = symbols[2]) {
  libs = []
  for (let i of getAdjacent(board, x, y)) {
    if (i[2] == sym) {
      libs.push(i)
    }
  }
  return libs
}

function getAllOpenSpaces(straightBoard) {
  spaces = []
  for (let i of straightBoard) {
    if (i[2] == symbols[2]) {
      spaces.push(i)
    }
  }
  return spaces
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

function getAllChains(board, icon) { //split into three lists with all icons? wip
  // WIP
  var chains = []
  var cuttingBoard = getStraightBoard(board)
  // var straightBoard = JSON.parse(JSON.stringify(cuttingBoard))
  for (let i in cuttingBoard) {
    if (cuttingBoard[i][2] != icon || cuttingBoard[i] == "s") {
      cuttingBoard[i] = "s"
      continue
    }
    var chain = getChain(board, cuttingBoard[i][0], cuttingBoard[i][1], icon)
    for (let i of chain) {
      for (let ii in cuttingBoard) {
        if (cuttingBoard[ii][0] == i[0] && cuttingBoard[ii][1] == i[1]) {
          cuttingBoard[ii] = 's'
        }
      }
      cuttingBoard[cuttingBoard.indexOf(i)] = 's'
    }
    chains.push(chain)
  }
  return chains
}
function getValidMoves(straightBoard, player) {
  validMoves = []
  for (let i of getAllOpenSpaces(straightBoard))
    if (checkValidity(board, i[0], i[1], player)) {
      validMoves.push(i)
    }
    return(validMoves)
}

function getChainLiberties(board, x, y, player) {
  var chain = getChain(board, x, y, player)
  var liberties = []
  for (let links of chain) {
    for (let lib of getSpaces(board, links[0], links[1], symbols[2]))
      if (lib[2] == symbols[2]) {
        liberties.push(lib)
      }
  }
  return liberties
}

function getAdjacent(board, x, y) {
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
  board = createBoard(document.getElementById("boardsize").value)
  straightBoard = getStraightBoard(board)
  currentPlayer = 1
  lastPlay = []
  nextTurn()
}

async function endGame() {
  var time = 3000
  var winner = 0
  currentPlayer == 1 ? winner = 0 : winner = 1
  document.getElementById("winner").innerHTML = "Winner: " + symbols[winner]
  document.getElementById("playerIcon").innerHTML = ""
  editedPlayerIcon = true
  startGame()
  await sleep(time);
  document.getElementById("winner").innerHTML = ""
  editedPlayerIcon = false
  document.getElementById("playerIcon").innerHTML = "Player: " + symbols[currentPlayer]
}


document.getElementById("p1").checked = true
document.getElementById("p2").checked = true

startGame()