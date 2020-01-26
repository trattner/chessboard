/*
TO-DO:

- figure out how to draw board based on game state
- when a dragged piece is dropped, check if isValidMove
- if true, drop the piece
  - if there is an opponent piece on the square, end the game! reset the board?
  - if not, update the game state (including incrementing turn number and whose turn it is to move)
- if false, kick it back to its original position

*/

/* // real chess game
var starting_piece_positions = {
  'wk':['e1'],
  'wq':['d1'],
  'wr':['h1', 'a1'],
  'wb':['c1','f1'],
  'wn':['b1','g1'],
  'wp':['a2','b2','c2','d2','e2','f2','g2','h2'],
  'bk':['e8'],
  'bq':['d8'],
  'br':['h8','a8'],
  'bn':['b8','g8'],
  'bb':['c8','f8'],
  'bp':['a7','b7','c7','d7','e7','f7','g7','h7']
};
*/

// bishops and rooks

// X-FEN https://en.wikipedia.org/wiki/X-FEN
var initial_game_state = 'r6r/8/8/8/8/8/8/2B2B2 w 1';
var current_game_state = initial_game_state;

// generate starting piece positions based on game state


var starting_piece_positions = {
  B: ['c1', 'f1'],
  r: ['h8', 'a8'],
};

// INITIAL SETTINGS
var board_screen_percent = 0.9;
var light_sq_color = '#ffe1bc';
var dark_sq_color = '#ba8668';

// INITIALIZE GLOBAL VARS
var game_state_log = [];
var square_coord_dict = {};
var char_to_ind = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};
var ind_to_char = {
  0: 'a',
  1: 'b',
  2: 'c',
  3: 'd',
  4: 'e',
  5: 'f',
  6: 'g',
  7: 'h',
};

function drawPiecesFromGameState(gameState, s_sq) {
  //ADD PIECES
  var piece_links = {
    k:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/1200px-Chess_kdt45.svg.png',
    K:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/1200px-Chess_klt45.svg.png',
    q:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chess_qdt45.svg/1200px-Chess_qdt45.svg.png',
    Q:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chess_qlt45.svg/1200px-Chess_qlt45.svg.png',
    r:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chess_rdt45.svg/1200px-Chess_rdt45.svg.png',
    R:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chess_rlt45.svg/1200px-Chess_rlt45.svg.png',
    b:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chess_bdt45.svg/1200px-Chess_bdt45.svg.png',
    B:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chess_blt45.svg/1200px-Chess_blt45.svg.png',
    n:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Chess_ndt45.svg/1200px-Chess_ndt45.svg.png',
    N:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/1200px-Chess_nlt45.svg.png',
    p:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chess_pdt45.svg/1200px-Chess_pdt45.svg.png',
    P:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chess_plt45.svg/1200px-Chess_plt45.svg.png',
  };

  // const gameConfig = gameState.split(' ')[0];
  //
  // for (let rowConfig of gameConfig.split('/')) {
  //   for (let c of rowConfig) {
  //     console.log(c);
  //   }
  // }

  for (piece in starting_piece_positions) {
    for (coord of starting_piece_positions[piece]) {
      //console.log(piece + "-" + coord);
      var elem = document.createElement('img');
      elem.src = piece_links[piece];
      elem.style.width = s_sq;
      elem.style.height = s_sq;
      elem.style.zIndex = 2;
      elem.style.position = 'absolute';
      var geom = document.getElementById(coord).getBoundingClientRect();
      elem.style.left = geom.left;
      elem.style.top = geom.top;
      elem.id = piece + '_' + coord;
      dragElement(elem);
      $('#container').append(elem);
    }
  }

  // ATTRIBUTE PIECES
  $("#container").append('<br><br><br>chess pieces from wikipedia');

  // CREATE DATA STRUCTURE
  var game_state = [];
  for (i in ind_to_char) {
    game_state.push([]);
    for (j in ind_to_char) {
      game_state[i].push('');
    }
  }
  for (piece in starting_piece_positions) {
    for (coord of starting_piece_positions[piece]) {
      var ind = coordToIndex(coord);
      game_state[(ind[0], ind[1])] = piece;
    }
  }
  console.log(game_state);

  ///// ACTIVATE DRAGGING ////////

  function dragElement(elmnt) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (document.getElementById(elmnt.id + 'header')) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + 'header').onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      startsquare = getCurrentSquare(pos3, pos4);
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
      elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
      endsquare = getCurrentSquare(pos3, pos4);
      snapToSquare(elmnt, endsquare);
    }
  }
  ///////////////////////

  // set helper lists a1 -> h8 for getting current square
  var file_coords = [];
  var rank_coords = [];
  for (c in char_to_ind) {
    square = c + String(char_to_ind[c] + 1);
    geom = document.getElementById(square).getBoundingClientRect();
    file_coords.push(geom.left);
    rank_coords.push(geom.top);
  }


    function getCurrentSquare(x, y) {
      var file_index = 7;
      for (i in file_coords) {
        if (x < file_coords[i]) {
          file_index = i;
          if (i == 0) {
            file_index = 1;
          }
          break;
        }
      }
      var rank_index = 8;
      for (i in rank_coords) {
        if (y > rank_coords[i]) {
          rank_index = parseInt(i) + 1;
          break;
        }
      }
      var square = ind_to_char[file_index - 1] + String(rank_index);
      return square;
    }

    function snapToSquare(elem, square) {
      elem.style.left = document
        .getElementById(square)
        .getBoundingClientRect().left;
      elem.style.top = document
        .getElementById(square)
        .getBoundingClientRect().top;
    }
}

$(document).ready(function() {
  //COMPUTE BOARD DIMENSIONS
  var w_win = window.innerWidth;
  var h_win = window.innerHeight;
  var d_win = Math.min(w_win, h_win);
  var s_board = d_win * board_screen_percent;
  var s_sq = s_board / 8;

  //CREATE BOARD
  var board = document.createElement('div');
  board.id = 'board';
  board.style.zIndex = 0;
  board.style.width = s_board;
  board.style.height = s_board;
  board.style.margin = 'auto';
  board.style.marginTop = (h_win - s_board) / 2;
  board.style.display = 'table';
  board.style.border = '1px solid black';
  $('#container').append(board);

  //CREATE SQUARES
  var cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  var rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
  var sq_color = light_sq_color;

  for (const r of rows) {
    row = document.createElement('div');
    row.id = r;
    row.style.zIndex = 0;
    row.style.width = s_board;
    row.style.height = s_sq;
    row.style.display = 'table-row';
    //row.style.backgroundColor = "green";

    for (const col of cols) {
      square = document.createElement('div');
      square.id = col + r;
      //square.title = col + r; //TOOLTIP
      square.style.zIndex = 0;
      square.style.width = s_sq;
      square.style.height = s_sq;
      square.style.display = 'table-cell';
      square.style.backgroundColor = sq_color;
      sq_color = flipColor(sq_color);
      row.append(square);
    }
    sq_color = flipColor(sq_color);
    $('#board').append(row);
  }

  //CREATE DICT OF SQUARES AND COORD
  for (const r of rows) {
    for (const col of cols) {
      square = col + r;
      geom = document.getElementById(square).getBoundingClientRect();
      square_coord_dict[square] = {left: geom.left, top: geom.top};
      square_coord_dict[[geom.left, geom.top]] = square;
    }
  }

  //ADD PIECES
  drawPiecesFromGameState(initial_game_state, s_sq);

});

//// HELPER FUNCTIONS ////

function flipColor(color) {
  if (color == light_sq_color) {
    return dark_sq_color;
  } else {
    return light_sq_color;
  }
}

function coordToIndex(coord) {
  //take 'e4' and make it numeric
  letter = coord[0];
  number = coord[1];
  y = number - 1;
  x = char_to_ind[letter];
  return [y, x]; // since array of arrays stacks ranks
}

function indexToCoord(ind) {
  //take number and make it 'h1'
  number = ind[0] + 1;
  letter = ind_to_char[ind[1]];
  return letter + number;
}

//never need just .x .y for left, top and .width .height if desired!
function getGeom(elem_id) {
  console.log(document.getElementById(elem_id).getBoundingClientRect());
}

//// ADVANCED PAGE-RESPONSIVE FUNCTIONS ////

function onResize() {
  console.log('resized!');
  console.log('w = ' + String(window.innerWidth));
  console.log('h = ' + String(window.innerWidth));

  /*
  $(window).resize(function(){
      var newwidth = $(window).width();
      var newheight = $(window).height();
      $("#element").height(newheight).width(newwidth);
  });
  */
}

function setBoardDimensions() {
  // to do
}

/*

LOG

6/13
Done with initial setup, board and piece sizing.
Next is piece movement, then data structure to keep track of board state.






INITIAL NOTES

html:
layer 0 - board
layer 1 - animation dots
layer 2 - pieces
layer 3 - movement and capturing

later:
meta-data about castling, previous move, etc.
command: piece from sq --> sq


HELPFUL CODE SNIPPETS

$("p").css("background-color", "yellow");

$("#board").css({
  "height": s_board,
  "width": s_board
});


function insert() {
          $("#parent").append('<div id = "newElement">A '
              + 'Computer Science portal for geeks</div>');
      }


      function appendText() {
        var txt1 = "<p>Text.</p>";               // Create element with HTML
        var txt2 = $("<p></p>").text("Text.");   // Create with jQuery
        var txt3 = document.createElement("p");  // Create with DOM
        txt3.innerHTML = "Text.";
        $("body").append(txt1, txt2, txt3);      // Append the new elements
      }

*/

// Return piece at index or empty string
function pieceAtIndex(gameState, ind) {
  const gameConfig = gameState.split(' ')[0];
  const row = ind[0]
  const col = ind[1]

  const rowConfigToSearch = gameConfig.split('/')[7 - row] // X-FEN starts at top left, row-col starts in bottom left

  const expandedRow = ["", "", "", "", "", "", "", ""]
  let currentIndex = 0
  for (let c of rowConfigToSearch) {
    if (c >= '0' && c <= '9') {
      currentIndex += parseInt(c)
    } else {
      expandedRow[currentIndex] = c
      currentIndex++
    }
  }

  return expandedRow[col]
}

function pieceToColor(piece){
  var color = 'b';
  if (['R','K','N','B','P','Q'].includes(piece)){
    color = 'w';
  }
  return color;
}

function isValidMove(game_state,move_tuple){
  // inputs: a game state in X-FEN format (https://en.wikipedia.org/wiki/X-FEN) and a desired move
  // outputs: boolean is this move valid
  // Move is (piece,starting square,new square)
  var game_string = game_state.split(' ')[0]; //game stuff
  var color_to_move = game_state.split(' ')[1];
  var piece = move_tuple[0];
  var start_square = move_tuple[1];
  var end_square = move_tuple[2];
  var start_square_column = start_square[0];
  var start_square_row = start_square[1];
  var end_square_column = end_square[0];
  var end_square_row = end_square[1];
  var start_square_as_numbers = coordToIndex(start_square);
  var end_square_as_numbers = coordToIndex(end_square);

  // false if not correct color
  if (color_to_move !== pieceToColor(piece)){
    console.log('not correct color to move');
    return false;
  }

  // false if piece not in board
  if (!game_string.includes(piece)) {
    console.log('piece not found in game state');
    return false;
  }

  // false if piece not there at starting square
  if (pieceAtIndex(game_state, start_square_as_numbers) !== piece) {
    console.log('moving piece not found at starting sqaure');
    return false;
  }

  // if start end square are same, false
  if (start_square == end_square) {
    console.log("start end square are same")
    return false;
  }

  // false if start or end are out of bounds of board
  if (start_square_as_numbers[0] < 0 || start_square_as_numbers[0] > 7 || start_square_as_numbers[1] < 0 || start_square_as_numbers[1] > 7 || end_square_as_numbers[0] < 0 || end_square_as_numbers[0] > 7 || end_square_as_numbers[1] < 0 || end_square_as_numbers[1] > 7){
    console.log("start or end are out of bounds of board")
    return false;
  }

  // false if piece movement not correct
  if (piece.toLowerCase() === "r") {
    // Rooks have to be on the same row or the same column
    if ((start_square_row  === end_square_row) || (start_square_column === end_square_column)) {
      // false if moving thru a piece

      // find all squares in between
      var current_row_index = start_square_as_numbers[0];
      var current_col_index = start_square_as_numbers[1];
      var squares_in_between = [];
      var x_dist = Math.abs(end_square_as_numbers[0] - start_square_as_numbers[0]);
      var y_dist = Math.abs(end_square_as_numbers[1] - start_square_as_numbers[1]);

      var y_inc = 1;
      var x_inc = 1;
      if (x_dist == 0) {
        x_inc = 0;
      } else {
        x_inc = ( end_square_as_numbers[0] - start_square_as_numbers[0] ) / x_dist;
      }
      if (y_dist == 0){
        y_inc = 0;
      } else {
        y_inc = ( end_square_as_numbers[1] - start_square_as_numbers[1] ) / y_dist;
      }

      // console.log("should be 1", x_inc)
      // console.log("should be 0", y_inc)
      // console.log()
      var n_steps = Math.max(x_dist, y_dist)
      Array.from(Array(n_steps), (_, i) => {
        current_row_index += x_inc
        current_col_index += y_inc

      squares_in_between.push([current_row_index, current_col_index]);
      })

      for (const sq of squares_in_between) {
        const piece = pieceAtIndex(game_state,sq)
        // If it's the end square and the piece is the opponent's, return true. If it's
        if (sq[0] === end_square_as_numbers[0] && sq[1] === end_square_as_numbers[1]) {
          if (pieceToColor(piece) !== color_to_move) {
            return true
          }
        }

        // Can't run into your own piece
        if (piece && pieceToColor(piece) == color_to_move) {
          return false;
        } else if (piece && pieceToColor(piece !== color_to_move)) {
          return false;
        }
      }
      // return true;
    } else {
      return false;
    }
  }

  if (piece.toLowerCase() === "b") {
    // Bishops have to be on the same diagonal
    // If x and y distances are equivalent, they are on the same diagonal
    var x_dist = Math.abs(end_square_as_numbers[0] - start_square_as_numbers[0]);
    var y_dist = Math.abs(end_square_as_numbers[1] - start_square_as_numbers[1]);
    if (x_dist === y_dist) {
      // find all squares in between
      var current_row_index = start_square_as_numbers[0];
      var current_col_index = start_square_as_numbers[1];
      var squares_in_between = [];
      var x_dist = Math.abs(end_square_as_numbers[0] - start_square_as_numbers[0]);
      var y_dist = Math.abs(end_square_as_numbers[1] - start_square_as_numbers[1]);

      var y_inc = 1;
      var x_inc = 1;
      if (x_dist == 0) {
        x_inc = 0;
      } else {
        x_inc = ( end_square_as_numbers[0] - start_square_as_numbers[0] ) / x_dist;
      }
      if (y_dist == 0){
        y_inc = 0;
      } else {
        y_inc = ( end_square_as_numbers[1] - start_square_as_numbers[1] ) / y_dist;
      }

      var n_steps = Math.max(x_dist, y_dist)
      Array.from(Array(n_steps), (_, i) => {
        current_row_index += x_inc
        current_col_index += y_inc

        squares_in_between.push([current_row_index, current_col_index]);
      })

      for (const sq of squares_in_between) {
        const piece = pieceAtIndex(game_state,sq)
        // If it's the end square and the piece is the opponent's, return true. If it's
        if (sq[0] === end_square_as_numbers[0] && sq[1] === end_square_as_numbers[1]) {
          if (pieceToColor(piece) !== color_to_move) {
            return true
          }
        }

        // Can't run into your own piece
        if (piece && pieceToColor(piece) == color_to_move) {
          return false;
        } else if (piece && pieceToColor(piece !== color_to_move)) {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  return true;
}




/* wishlist

- game state structure
- server + db logging
- multiple instances / pages with routes (custom names) / save (route + password / create + visit tabs)
- piece setup, erasing
- game history up to 500, forward + back buttons
- settings, resize page, board resize, colors
- piece snapping to cursor center
- game rules, highlighting
- mini-games + comp levels
- chess engine

*/
