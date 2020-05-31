'use strict';

const matrixModify = (str, matrix) => { //adding cross to the matrix
  const coords = str.split('-');
  if (!matrix[coords[0]][coords[1]]) matrix[coords[0]][coords[1]] = 1;
  else return true;
};

const checker = matrix => { //end game algorithm
  let isEnded = false;
  matrix.forEach(row => {
    row.forEach((cell1, i) => {
      row.forEach((cell2, j) => {
        if(cell1 && cell2 && i !== j) {
          matrix.forEach(row2 => {
            if(row !== row2 && row2[i] && row2[j]) {
              isEnded = true;
            }
          })
        }
      })
    })
  })
  return isEnded
};
const matrixCreate = game => { // create matrix
  game.matrix = [];
  for (let i = 0; i < game.N; i++) {
    game.matrix.push([]);
    for (let j = 0; j < game.N; j++) {
      game.matrix[i].push(0);
    }
  }
  return (game);
};

module.exports = {
  matrixModify,
  checker,
  matrixCreate,
};
