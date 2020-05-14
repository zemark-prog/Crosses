/* eslint-disable max-len */
/* eslint-disable camelcase */
'use strict';

const MAX_BUTTONS = 8;
const MIN_BUTTONS = 4;

let N = 4;

const Telegraf = require('telegraf');
const TOKEN = '1260445498:AAEsTHtANxXyBx9xN93m0w6pN8OIcJrsAK4';
const bot = new Telegraf(TOKEN);

const CHATES = {};

function getGameById(gameID, chatID) {
  if (CHATES[chatID]) {
    for (const id in CHATES[chatID].games) {
      if (id === gameID.toString()) return CHATES[chatID].games[id];
    }
  }
}

function nextTurn(currUser, users) {
  let index = users.indexOf(currUser);
  return users[++index >= users.length ? 0 : index];
}

function randomInt(min, max) {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

const matrixModify = (str, matrix) => {
  const coords = str.split('-');
  matrix[coords[0]][coords[1]] = 1;
};

const checker = matrix => {
  let isEnded = false;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (matrix[i][j]) {
        for (let k = j + 1; k < N; k++) {
          if (matrix[i][k]) {
            for (let l = i + 1; l < N; l++) {
              if (matrix[l][j] && matrix[l][k]) {
                console.log('easy');
                isEnded = true;
              }
            }
          }
        }
      }
    }
  }
  return isEnded;
};

bot.on('text', ctx => {
  const text = ctx.message.text;
  const command = text.split(' ');
  const firstPart = command[0];
  let secondPart = command[1];
  if (!secondPart) secondPart = 4;
  secondPart = parseInt(secondPart);
  console.log(typeof(secondPart));
  if (typeof(secondPart) !== 'number') secondPart = 4;
  if (firstPart === '/start_game' || firstPart === '/start_game@CrossesBot') {
    if (secondPart < MIN_BUTTONS) secondPart = MIN_BUTTONS;
    else if (secondPart > MAX_BUTTONS) secondPart = MAX_BUTTONS;
    secondPart = Math.round(secondPart);
    N = secondPart;
    const chatID = ctx.message.chat.id;

    if (!CHATES[chatID]) CHATES[chatID] = { games: {} };
    const currGameAmount = Object.keys(CHATES[chatID].games).length;
    CHATES[chatID].games[currGameAmount + 1] = { };

    const username = ctx.message.from.username;
    CHATES[chatID].games[currGameAmount + 1].users = [username];
    const inline_keyboard = [[{ text: 'Join!', callback_data: `${currGameAmount + 1}:addUser:${username}` }]];
    const keyboard = {
      reply_markup: JSON.stringify({
        inline_keyboard
      })
    };
    ctx.reply('Current users:\n' + username + '\n', keyboard);
  }
});

bot.on('callback_query', ctx => {
  const chatID = ctx.update.callback_query.message.chat.id;
  const messageID = ctx.update.callback_query.message.message_id;
  const username = ctx.update.callback_query.from.username;
  const data = ctx.update.callback_query.data.split(':');
  const gameID = +data[0];
  const queryFor = data[1];
  const queryData = data[2];
  let game = getGameById(gameID, chatID);
  console.log(data);
  if (game) {
    const users = game.users;
    if (queryFor === 'addUser') {
      if (!users.includes(username)) {
        users.push(username);
        game.matrix = [];
        for (let i = 0; i < N; i++) { // create matrix
          game.matrix.push([]);
          for (let j = 0; j < N; j++) {
            game.matrix[i].push(0);
          }
        }
        const inline_keyboard = [];
        for (let i = 0; i < N; i++) {
          inline_keyboard.push([]);
          for (let j = 0; j < N; j++) {
            inline_keyboard[i].push({ text: ' ', callback_data: (`${gameID}:addCross:${i}-${j}`).toString() });
          }
        }
        const keyboard = {
          reply_markup: JSON.stringify(
            {
              inline_keyboard
            })
        };
        const currUser = users[randomInt(0, users.length - 1)];
        game.turn = currUser;
        bot.telegram.editMessageText(chatID, messageID, undefined, users.join(' vs ') + (`\nTurn : ${currUser}`).toString(), keyboard);
      }
    } else if (queryFor === 'addCross') {
      if (game.turn === username) {
        const matrix = game.matrix;
        matrixModify(queryData, matrix);
        const inline_keyboard = [];
        for (let i = 0; i < N; i++) {
          inline_keyboard.push([]);
          for (let j = 0; j < N; j++) {
            inline_keyboard[i].push({ text: matrix[i][j] ? '❌' : ' ', callback_data: (`${gameID}:addCross:${i}-${j}`).toString() });
          }
        }
        const keyboard = {
          reply_markup: JSON.stringify(
            {
              inline_keyboard
            })
        };

        const isEnded = checker(matrix);
        if (isEnded) {
          bot.telegram.editMessageText(chatID, messageID, undefined, `${game.turn} is лох!`);
          game = null;
        } else {
          game.turn = nextTurn(game.turn, users);
          bot.telegram.editMessageText(chatID, messageID, undefined, users.join(' vs ') + (`\nTurn: ${game.turn}`).toString(), keyboard);
        }
      }
    }
  }
});

bot.launch();
