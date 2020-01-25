console.log('Start! ... ');

var test_game_state = 'r6r/8/8/8/8/8/8/2B2B2';
var test_move_1 = ['B','c1','e4'];
var test_move_2 = []


function isValidMove(game_state,move_tuple){
  // inputs: a game state in X-FEN format (https://en.wikipedia.org/wiki/X-FEN) and a desired move
  // outputs: boolean is this move valid
  // Move is (piece,starting square,new square)
  var output_bool = true;

  var game_state.split(" ");

  // false if not correct color

  // false if piece not in board

  // false if piece movement not correct

  // false if moving thru a piece
  // lands on same color piece but ok to land on opponent piece



  // false if

  return output_bool;

}


console.log(isValidMove(test_game_state,));
