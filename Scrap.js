/** @param {NS} ns */
// TODO: get eyes of chain function, get liberties of chain function

export async function main(ns) {
  ns.go.analysis.resetStats(true)
  var boardsize = 7
  var delay = 5
  var opponentChoicesWeighted = [
    ["Netburners", 4], ["Slum Snakes", 1], ["The Black Hand", 2], ["Tetrads", 1], ["Daedalus", 3], ["Illuminati", 1]
  ]
  var opponentChoices = []
  for (let x of opponentChoicesWeighted) {
    for (let y of numExpand(x[1])) {
      opponentChoices.push(x[0])
    }
  }
  ns.print(opponentChoices)
  var moveOptions = []
  var statWeights = {
    liberties: .3,
    chainLiberties:.6,
    newChainLength: .2,
    preventChain: .2,
  }
  var result, movesWithWeights, weightsIso


  function numExpand(numb) {
    //goes up to the number, includes 0,does not include number
    var looper = 0
    var returnal = []

    while (looper < numb) {
      returnal.push(looper)
      looper += 1
    }
    return returnal
  }
  function includesDeep(array, value) {
    return array.some((subArray) => {
      return subArray.every(
        (subArrayElem, index) => subArrayElem === value[index]
      );
    });
  }


  function getValidMovesInXY(board, size) {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Make sure the point is a valid move
        const isValidMove = board[x][y] === true;
        // Leave some spaces to make it harder to capture our pieces.
        // We don't want to run out of empty node connections!
        const isNotReservedSpace = x % 2 === 1 || y % 2 === 1;

        if (isValidMove && isNotReservedSpace) {
          moveOptions.push([x, y]);
        }
      }
    }
  }

  function checkCircle(x, y, distance, list) {
    var adjacents = []
    for (let itemx in list) {
      for (let itemy in list[itemx].split('')) {
        ns.print(itemx + ':' + itemy + "-" + list[itemx][itemy] + x + y)
        if ((parseInt(itemx) !== x || parseInt(itemy) !== y) && (itemx >= x - distance && itemx <= x + distance) && (itemy >= y - distance && itemy <= y + distance)) {
          adjacents.push([itemx, itemy, list[itemx][itemy]])
        }
      }
    }
    return adjacents
  }
  function checkAdjacent(x, y, distance, list) {
    var adjacents = []
    for (let itemx in list) {
      for (let itemy in list[itemx].split('')) {
        // ns.print(itemx + ':' + itemy + "-" + list[itemx][itemy] + x + y)
        if ((parseInt(itemx) !== x || parseInt(itemy) !== y) && ((itemx >= x - distance && itemx <= x + distance && parseInt(itemy) == y) || (itemy >= y - distance && itemy <= y + distance && parseInt(itemx) == x))) {
          adjacents.push([itemx, itemy, list[itemx][itemy]])
        }
      }
    }
    return adjacents
  }
  function checkAntiCross(x, y, distance, list) {
    //checks for pieces that are not in the cross formed by a point.
    var adjacents = []
    for (let itemx in list) {
      for (let itemy in list[itemx].split('')) {
        // ns.print(itemx+':'+itemy+"-"+list[itemx][itemy])
        if ((itemx != x && itemy != y) && (itemx >= x - distance && itemx <= x + distance) && (itemy >= y - distance && itemy <= y + distance)) {
          adjacents.push([itemx, itemy, list[itemx][itemy]])
        }
      }
    }
    return adjacents
  }
  function Liberties(x, y, item = '.') {
    //X.O
    let adjacents = checkAdjacent(x, y, 1, boardState)
    let libs = []
    for (x of adjacents) {
      if (x[2] == item) {
        libs.push(x)
      }
    }
    return libs
  }
  function GetChainLiberties(x, y) {
    var chain = getChain(x, y)
    var liberties = []
    for (let links of chain) {
      for (let lib of Liberties(links[0],links[1]))
      if (lib[2] == '.') {
          liberties.push(lib)
      }
    }
    return liberties
  }
  function validWeights(moves) {
    let returnal = []
    for (let x of moves) {
      returnal.push([x[0], x[1], .5])
    }

    return returnal
  }
  function getChain(x, y, typePiece = 'X') {
    var chain = []
    // add self
    chain.push([x, y, boardState[x][y]])
    var i = 0
    while (i < chain.length && chain[i] !== undefined) {
      var adjs = checkAdjacent(chain[i][0], chain[i][1], 1, boardState)
      for (let singAdj of adjs) {
        if (singAdj[2] == typePiece && !includesDeep(chain, singAdj)) {
          chain.push(singAdj)

        }
      }
      i += 1
    }
    return chain
  }
  ns.go.resetBoardState(opponentChoices[Math.floor(Math.random() * opponentChoices.length)], boardsize)

  while (true) {
    //GET VALID MOVES (In moveOptions)
    var boardState = ns.go.getBoardState()
    var validMoves = ns.go.analysis.getValidMoves();
    getValidMovesInXY(validMoves, boardsize)

    await ns.sleep(delay)

    movesWithWeights = validWeights(moveOptions)

    //EDIT WEIGHTS
    for (let x in movesWithWeights) {
      let libertiesOpen = Liberties(movesWithWeights[x][0], movesWithWeights[x][1]).length
      movesWithWeights[x][2] *= (libertiesOpen * statWeights.liberties) + 1
    }
    for (let x in movesWithWeights) {
      let chainlength = getChain(movesWithWeights[x][0], movesWithWeights[x][1]).length
      movesWithWeights[x][2] *= (chainlength * statWeights.newChainLength) + 1
    }
    for (let x in movesWithWeights) {
      let chainlength = getChain(movesWithWeights[x][0], movesWithWeights[x][1], 'O').length
      movesWithWeights[x][2] *= (chainlength * statWeights.preventChain) + 1
    }
    for (let x in movesWithWeights) {
        let chainLibs = GetChainLiberties(movesWithWeights[x][0],movesWithWeights[x][1]).length
        movesWithWeights[x][2] *= (chainLibs * statWeights.chainLiberties) + 1
    }

    //GET HIGHEST WEIGHT
    weightsIso = []
    for (let x of movesWithWeights) {
      weightsIso.push(x[2])
    }
    var highestWeight = Math.max(...weightsIso)
    // ns.print(highestWeight)
    var listOfHighestWeights = []
    for (let x in movesWithWeights) {
      if (movesWithWeights[x][2] >= highestWeight)
        listOfHighestWeights.push(movesWithWeights[x])
    }

    // ns.print(listOfHighestWeights)
    // ns.print('new')
    // for (let x in movesWithWeights) {
    // ns.print(x+':'+getChain(movesWithWeights[x][0], movesWithWeights[x][1]).length)
    // }

    //CAST RANDOM MOVE
    const randomIndex = Math.floor(Math.random() * listOfHighestWeights.length);
    if (listOfHighestWeights === undefined || listOfHighestWeights.length == 0) {
      // Pass turn if no moves are found
      result = await ns.go.passTurn();
    } else {
      // Play the selected move
      result = await ns.go.makeMove(listOfHighestWeights[randomIndex][0], listOfHighestWeights[randomIndex][1]);
    }
    if (result.type == "gameOver") {
      ns.go.resetBoardState(opponentChoices[Math.floor(Math.random() * opponentChoices.length)], boardsize)
    }
    moveOptions = []
  }
}