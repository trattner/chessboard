// INITIAL SETTINGS
const board_screen_percent = 0.8;
const light_sq_color = '#fff'; //'#ffe1bc';
const dark_sq_color = '#dbdbdb';//'#e0e0e0';//'#c9c9c9'; //'#ba8668';


// REFERENCE MATERIAL AND BOARD GENERATION
const piece_links = {
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
var square_coord_dict = {};
var piece_coord_dict = {};
const char_to_ind = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};
const ind_to_char = {
  0: 'a',
  1: 'b',
  2: 'c',
  3: 'd',
  4: 'e',
  5: 'f',
  6: 'g',
  7: 'h',
};
var s_sq = 50;
var clone_n = 0;
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
var file_coords = [];
var rank_coords = [];
function flipColor(color) {
  if (color == light_sq_color) {
    return dark_sq_color;
  } else {
    return light_sq_color;
  }
}
$(document).ready(function() {
  //COMPUTE BOARD DIMENSIONS
  var w_win = window.innerWidth;
  var h_win = window.innerHeight;
  console.log(w_win);
  console.log(h_win);
  var d_win = Math.min(w_win, h_win);
  var s_board = d_win * board_screen_percent;
  s_sq = s_board / 8;

  //CREATE BOARD
  var board = document.createElement('div');
  board.id = 'board';
  board.style.zIndex = 0;
  board.style.width = s_board;
  board.style.height = s_board;
  board.style.margin = 'auto';
  board.style.marginTop = '60px';//(h_win - s_board) / 2;
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
  for (c in char_to_ind) {
    square = c + String(char_to_ind[c] + 1);
    geom = document.getElementById(square).getBoundingClientRect();
    file_coords.push(geom.left);
    rank_coords.push(geom.top);
  }

  for (const r of rows) {
    for (const col of cols) {
      square = col + r;
      geom = document.getElementById(square).getBoundingClientRect();
      square_coord_dict[square] = {left: geom.left, top: geom.top};
      square_coord_dict[[geom.left, geom.top]] = square;
    }
  }

  // PIECES ON SIDES
  for (var x = 0; x <= 16; x++){
    for ( var i = 0; i <= 5; i++){
      var piece = ['K','Q','R','B','N','P'][i];
      var elem = document.createElement('img');
      elem.src = piece_links[piece];
      elem.style.width = s_sq;
      elem.style.height = s_sq;
      elem.style.zIndex = 3;
      elem.style.position = 'absolute';
      elem.style.left = '5px';
      elem.style.top = (120 + i * (s_sq + 10)).toString() + 'px';
      elem.id = piece + '_' + x.toString();
      elem.classList.add('piece');
      dragElement(elem);
      $('#container').append(elem);
      if (!(piece in piece_coord_dict)){
        piece_coord_dict[piece] = {'left':elem.style.left,'top':elem.style.top};
      }
    }
    for (var i = 0; i <= 5; i++){
      var piece = ['k','q','r','b','n','p'][i];
      var elem = document.createElement('img');
      elem.src = piece_links[piece];
      elem.style.width = s_sq;
      elem.style.height = s_sq;
      elem.style.zIndex = 3;
      elem.style.position = 'absolute';
      elem.style.right = '5px';
      elem.style.top = (120 + i * (s_sq + 10)).toString() + 'px';
      elem.id = piece + '_' + x.toString();
      elem.classList.add('piece');
      dragElement(elem);
      $('#container').append(elem);
      if (!(piece in piece_coord_dict)){
        piece_coord_dict[piece] = {'left':elem.getBoundingClientRect().left,'top':elem.style.top};
      }
    }
  }

  // PUT LETTERS AND NUMBERS
  var offset = s_sq/12;
  // below
  for (var i = 0; i < 8; i++){
    var l = cols[i]
    var elem = document.createElement('div');
    elem.style.fontFamily = 'Lora';
    elem.style.fontSize = '24px';
    elem.style.textAlign = 'center';
    elem.style.fontWeight = 'bold';
    elem.innerHTML += l;
    elem.style.width = s_sq;
    elem.style.zIndex = 1;
    elem.style.position = 'absolute';
    elem.style.left = square_coord_dict[l+'1']['left'];
    elem.style.top = square_coord_dict[l+'1']['top'] + s_sq + offset;
    $('#container').append(elem);
  }
  // above
  for (var i = 0; i < 8; i++){
    var l = cols[i]
    var elem = document.createElement('div');
    elem.style.fontFamily = 'Lora';
    elem.style.fontSize = '24px';
    elem.style.textAlign = 'center';
    elem.style.fontWeight = 'bold';
    elem.innerHTML += l;
    elem.style.width = s_sq;
    elem.style.zIndex = 1;
    elem.style.position = 'absolute';
    elem.style.left = square_coord_dict[l+'8']['left'];
    elem.style.top = square_coord_dict[l+'8']['top'] - 5.85 * offset;
    $('#container').append(elem);
  }
  // left
  for (var i = 0; i < 8; i++){
    var n = rows[i]
    var elem = document.createElement('div');
    elem.style.fontFamily = 'Lora';
    elem.style.fontSize = '24px';
    elem.style.textAlign = 'center';
    elem.style.fontWeight = 'bold';
    elem.innerHTML += n;
    elem.style.height = s_sq;
    elem.style.marginTop = s_sq/2 - 12;
    elem.style.zIndex = 1;
    elem.style.position = 'absolute';
    elem.style.left = square_coord_dict['a1']['left'] - 3.8 * offset;
    elem.style.top = square_coord_dict[cols[i]+n]['top'];
    $('#container').append(elem);
  }
  // right
  for (var i = 0; i < 8; i++){
    var n = rows[i]
    var elem = document.createElement('div');
    elem.style.fontFamily = 'Lora';
    elem.style.fontSize = '24px';
    elem.style.textAlign = 'center';
    elem.style.fontWeight = 'bold';
    elem.innerHTML += n;
    elem.style.height = s_sq;
    elem.style.marginTop = s_sq/2 - 12;
    elem.style.zIndex = 1;
    elem.style.position = 'absolute';
    elem.style.left = square_coord_dict['h8']['left'] + s_sq + 2 * offset;
    elem.style.top = square_coord_dict[cols[i]+n]['top'];
    $('#container').append(elem);
  }

});
function getCurrentSquare(x, y) {
  if (x > square_coord_dict['h8']['left'] + s_sq || x < square_coord_dict['a1']['left'] || y > square_coord_dict['a1']['top'] + s_sq || y < square_coord_dict['a8']['top']){
    return 'out';
  } else {
    var file_index = 8;
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
}
function getGeom(elem_id) {
  console.log(document.getElementById(elem_id).getBoundingClientRect());
}
function pieceToColor(piece){
  var color = 'b';
  if (['R','K','N','B','P','Q'].includes(piece)){
    color = 'w';
  }
  return color;
}
function elemToPiece(elem){
  return elem.id[0];
}

// EMPTY FULL BUTTONS
function emptyBoard(){
  /*var new_pieces = document.getElementsByClassName('starting_piece');
  for (var i = 0; i < new_pieces.length; i++) {
    el = new_pieces[i];
    el.remove();
  }*/
  var all_pieces = document.getElementsByClassName("piece");
  for (i = 0; i < all_pieces.length; i++) {
    el = all_pieces[i];
    p = elemToPiece(el)
    el.style.top = piece_coord_dict[p]['top'];
    el.style.left = piece_coord_dict[p]['left'];
  }
}
function fillBoard(){
  emptyBoard();
  var starting_piece_positions = {
    'K':['e1'],
    'Q':['d1'],
    'R':['h1', 'a1'],
    'B':['c1','f1'],
    'N':['b1','g1'],
    'P':['a2','b2','c2','d2','e2','f2','g2','h2'],
    'k':['e8'],
    'q':['d8'],
    'r':['h8','a8'],
    'n':['b8','g8'],
    'b':['c8','f8'],
    'p':['a7','b7','c7','d7','e7','f7','g7','h7']
  };
  for (piece in starting_piece_positions){
    for (var s = 0; s < starting_piece_positions[piece].length; s++){
      var square = starting_piece_positions[piece][s];
      var elem = document.createElement('img');
      elem.src = piece_links[piece];
      elem.style.width = s_sq;
      elem.style.height = s_sq;
      elem.style.zIndex = 3;
      elem.style.position = 'absolute';
      elem.style.left = square_coord_dict[square]['left'];
      elem.style.top = square_coord_dict[square]['top'];
      elem.classList.add('piece');
      elem.id = piece + '_clone_' + clone_n.toString();
      clone_n += 1;
      dragElement(elem);
      $('#container').append(elem);
    }
  }
}

// DRAG AND DROP (vanish off side)
function dragElement(elmnt) {
  var right_click = false;

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
    console.log(elmnt.id + ' -- ' + elmnt.className)
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

  function snapToSquare(elem, square) {
    elem.style.left = document
      .getElementById(square)
      .getBoundingClientRect().left;
    elem.style.top = document
      .getElementById(square)
      .getBoundingClientRect().top;
  }

  elmnt.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    right_click = true;
    var piece = elemToPiece(elmnt);
    elmnt.style.top = piece_coord_dict[piece]['top'];
    elmnt.style.left = piece_coord_dict[piece]['left'];
    return false;
  }, false);

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    endsquare = getCurrentSquare(pos3, pos4);

    if (endsquare == 'out' || right_click){
      var piece = elemToPiece(elmnt);
      elmnt.style.top = piece_coord_dict[piece]['top'];
      elmnt.style.left = piece_coord_dict[piece]['left'];
      right_click = false;
    } else {
      snapToSquare(elmnt, endsquare);
    }
  }


}
