// INITIAL SETTINGS
var board_screen_percent = .9;
var light_sq_color = "#ffe1bc";
var dark_sq_color = "#ba8668";

$(document).ready(function(){
  //COMPUTE BOARD DIMENSIONS
  var w_win = window.innerWidth;
  var h_win = window.innerHeight;
  var d_win = Math.min(w_win,h_win);
  var s_board = d_win * board_screen_percent;
  var s_sq = s_board / 8;

  //CREATE BOARD
  board = document.createElement("div");
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
  }

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
  }

  for (piece in starting_piece_positions) {
    for (coord of starting_piece_positions[piece]){
      console.log(piece + "-" + coord);
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
      $("#container").append(elem);
    }
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
