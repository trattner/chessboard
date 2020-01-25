/*
TO-DO:
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


/*
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

var starting_piece_positions = {
  'wb':['c1','f1'],
  'br':['h8','a8']
};


















// INITIAL SETTINGS
var board_screen_percent = .9;
var light_sq_color = "#ffe1bc";
var dark_sq_color = "#ba8668";

// INITIALIZE GLOBAL VARS
var game_state_log = [];
var square_coord_dict = {};
var char_to_ind = {
  'a':0,
  'b':1,
  'c':2,
  'd':3,
  'e':4,
  'f':5,
  'g':6,
  'h':7,
};
var ind_to_char = {
  0:'a',
  1:'b',
  2:'c',
  3:'d',
  4:'e',
  5:'f',
  6:'g',
  7:'h',
};

$(document).ready(function(){

  //COMPUTE BOARD DIMENSIONS
  var w_win = window.innerWidth;
  var h_win = window.innerHeight;
  var d_win = Math.min(w_win,h_win);
  var s_board = d_win * board_screen_percent;
  var s_sq = s_board / 8;

  //CREATE BOARD
  var board = document.createElement("div");
  board.id = "board";
  board.style.zIndex = 0;
  board.style.width = s_board;
  board.style.height = s_board;
  board.style.margin="auto";
  board.style.marginTop=(h_win-s_board)/2;
  board.style.display="table";
  board.style.border="1px solid black";
  $("#container").append(board);
  //$("#board").css("background-color","red");

  //CREATE SQUARES
  var cols = ['a','b','c','d','e','f','g','h'];
  var rows = ['8','7','6','5','4','3','2','1'];
  var sq_color = light_sq_color;

  for (const r of rows){
    row = document.createElement("div");
    row.id = r;
    row.style.zIndex = 0;
    row.style.width = s_board;
    row.style.height = s_sq;
    row.style.display = "table-row";
    //row.style.backgroundColor = "green";

    for (const col of cols){
      square = document.createElement("div");
      square.id = col + r;
      //square.title = col + r; //TOOLTIP
      square.style.zIndex = 0;
      square.style.width = s_sq;
      square.style.height = s_sq;
      square.style.display = "table-cell";
      square.style.backgroundColor = sq_color;
      sq_color = flipColor(sq_color);
      row.append(square);
    }
    sq_color=flipColor(sq_color);
    $("#board").append(row);
  }

  //CREATE DICT OF SQUARES AND COORD
  for (const r of rows){
    for (const col of cols){
      square = col + r;
      geom = document.getElementById(square).getBoundingClientRect();
      square_coord_dict[square] = {'left':geom.left,'top':geom.top};
      square_coord_dict[[geom.left,geom.top]] = square;
    }
  }

  //ADD PIECES
  var piece_links = {
    'bk':"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/1200px-Chess_kdt45.svg.png",
    'wk':"https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/1200px-Chess_klt45.svg.png",
    'bq':"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chess_qdt45.svg/1200px-Chess_qdt45.svg.png",
    'wq':"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chess_qlt45.svg/1200px-Chess_qlt45.svg.png",
    'br':"https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chess_rdt45.svg/1200px-Chess_rdt45.svg.png",
    'wr':"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chess_rlt45.svg/1200px-Chess_rlt45.svg.png",
    'bb':"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chess_bdt45.svg/1200px-Chess_bdt45.svg.png",
    'wb':"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chess_blt45.svg/1200px-Chess_blt45.svg.png",
    'bn':"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Chess_ndt45.svg/1200px-Chess_ndt45.svg.png",
    'wn':"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/1200px-Chess_nlt45.svg.png",
    'bp':"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chess_pdt45.svg/1200px-Chess_pdt45.svg.png",
    'wp':"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chess_plt45.svg/1200px-Chess_plt45.svg.png"
  };



  for (piece in starting_piece_positions) {
    for (coord of starting_piece_positions[piece]){
      //console.log(piece + "-" + coord);
      var elem = document.createElement("img");
      elem.src = piece_links[piece];
      elem.style.width = s_sq;
      elem.style.height = s_sq;
      elem.style.zIndex = 2;
      elem.style.position="absolute";
      var geom =  document.getElementById(coord).getBoundingClientRect();
      elem.style.left = geom.left;
      elem.style.top = geom.top;
      elem.id = piece + '_' + coord;
      dragElement(elem);
      $("#container").append(elem);
    }
  }

  // ATTRIBUTE PIECES
  // $("#container").append('<br><br><br>chess pieces from wikipedia');

  // CREATE DATA STRUCTURE
  var game_state = [];
  for (i in ind_to_char){
    game_state.push([]);
    for (j in ind_to_char){
      game_state[i].push('');
    }
  }
  for (piece in starting_piece_positions) {
    for (coord of starting_piece_positions[piece]){
      var ind = coordToIndex(coord);
      game_state[ind[0],ind[1]] = piece;
    }
  }
  console.log(game_state);


  /////// ACTIVATE DRAGGING ////////

  function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
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
      startsquare=getCurrentSquare(pos3,pos4);
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
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
      endsquare = getCurrentSquare(pos3,pos4)
      snapToSquare(elmnt, endsquare);
    }
  }
  /////////////////////////


  // set helper lists a1 -> h8 for getting current square
  var file_coords = [];
  var rank_coords = [];
  for (c in char_to_ind) {
    square = c + String(char_to_ind[c] + 1);
    geom = document.getElementById(square).getBoundingClientRect();
    file_coords.push(geom.left);
    rank_coords.push(geom.top);
  }

  function getCurrentSquare(x,y){
    var file_index = 7;
    for (i in file_coords){
      if (x < file_coords[i]){
        file_index = i;
        if (i == 0) {
          file_index = 1;
        }
        break;
      }
    }
    var rank_index = 8;
    for (i in rank_coords){
      if (y>rank_coords[i]){
        rank_index = parseInt(i)+1;
        break;
      }
    }
    var square = ind_to_char[file_index-1] + String(rank_index);
    return square;
  }

  function snapToSquare(elem, square){
    elem.style.left = document.getElementById(square).getBoundingClientRect().left;
    elem.style.top = document.getElementById(square).getBoundingClientRect().top;
  }


});






//// HELPER FUNCTIONS ////

function flipColor(color){
  if (color == light_sq_color){
    return dark_sq_color;
  } else {
    return light_sq_color;
  }
}

function coordToIndex(coord){ //take 'e4' and make it numeric
  letter = coord[0];
  number = coord[1];
  y = number - 1;
  x = char_to_ind[letter];
  return [y,x]; // since array of arrays stacks ranks
}

function indexToCoord(ind){ //take number and make it 'h1'
  number = ind[0] + 1;
  letter = ind_to_char[ind[1]];
  return letter + number;
}





//never need just .x .y for left, top and .width .height if desired!
function getGeom(elem_id){
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
