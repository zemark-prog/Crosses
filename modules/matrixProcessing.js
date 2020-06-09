'use strict';

const matrixModify = (coords, matrix) => { //adding cross to the matrix
  if (!matrix[coords[0]][coords[1]]) matrix[coords[0]][coords[1]] = 1;
  else return true;
};

const checker = matrix => (x, y) => { //end game algorithm
  let isEnded = false;
	for (let i = 0; i < matrix.length; i++) {
		if (matrix[i][y] !== 1 || i === +x)
			continue;
		for (let j = 0; j < matrix.length; j++) {
			if (matrix[x][j] !== 1 || j === +y || matrix[i][j] !== 1)
				continue;
			isEnded = true;
		}
  }
  return isEnded;
}

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
