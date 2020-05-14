/* eslint-disable max-len */
/* eslint-disable camelcase */
'use strict';

const N = 4;



const { Telegraf } = require('telegraf');

const bot = new Telegraf('1260445498:AAEsTHtANxXyBx9xN93m0w6pN8OIcJrsAK4');
bot.start(ctx => {
  const inline_keyboard = [];
  for (let i = 0; i < N; i++) {
    inline_keyboard.push([]);
    for (let j = 0; j < N; j++) {
      inline_keyboard[i].push({ text: ' ', callback_data: (`${i}-${j}`).toString() });
    }
  }
  const keyboard = {
    reply_markup: JSON.stringify(
      {
        inline_keyboard
      })
  };
  ctx.reply('Field', keyboard);
});

bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('text', ctx => {
  console.log(ctx.message);
  ctx.reply(ctx.message.text);
});

bot.on(['sticker', 'photo'], ctx => {
  console.log(ctx.message);
  return ctx.reply('Cool!');
});
bot.hears('hi', ctx => ctx.reply('Hey there'));
bot.launch();


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



