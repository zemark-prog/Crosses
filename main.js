'use strict';

const N = 4;


const matrix = [];
for (let i = 0; i < N; i++) {
  matrix[i] = [];
  for (let j = 0; j < N; j++) {
    matrix[i][j] = 0;
  }
}

const matrixModify = str => {
  const coords = str.split('-');
  matrix[coords[0]][coords[1]] = 1;
};

const checker = matrix => {
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (matrix[i][j]) {
        for (let k = j + 1; k < N; k++) {
          if (matrix[i][k]) {
            for (let l = i + 1; l < N; l++) {
              if (matrix[l][j] && matrix[l][k]) {
                console.log('easy');
              }
            }
          }
        }
      }
    }
  }
};
matrixModify('0-0');
matrixModify('2-0');
matrixModify('0-2');
matrixModify('2-2');
checker(matrix);
