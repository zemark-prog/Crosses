'use strict';

const Telegraf = require('telegraf');
const CONSTANTS = require('./config.js');
const { MAX_BUTTONS, MIN_BUTTONS, TOKEN } = CONSTANTS;
const MATRIX = require('./modules/matrix');
const { matrixModify, checker, matrixCreate } = MATRIX;

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

function randomInt(min, max) { //random func
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}


const processingNum = secondPart => {
  secondPart = +secondPart;
  if (isNaN(secondPart)) secondPart = 4;
  else if (secondPart < MIN_BUTTONS) secondPart = MIN_BUTTONS;
  else if (secondPart > MAX_BUTTONS) secondPart = MAX_BUTTONS;
  secondPart = Math.round(secondPart);
  return secondPart;
};
const genKeyboard = inline_keyboard => ({
  reply_markup: JSON.stringify({
    inline_keyboard
  })
});

const start = (firstPart, secondPart, chatID, username) => {
  if (firstPart === '/start_game' || firstPart === '/start_game@CrossesBot') {
    secondPart = processingNum(secondPart);
    if (!CHATES[chatID]) CHATES[chatID] = { games: {} };
    const currGameAmount = Object.keys(CHATES[chatID].games).length;
    CHATES[chatID].games[currGameAmount + 1] = { };
    CHATES[chatID].games[currGameAmount + 1].users = [username];
    CHATES[chatID].games[currGameAmount + 1].N = secondPart;
    const joinData = `${currGameAmount + 1}:addUser:${username}`;
    const inline_keyboard = [[{ text: 'Join!', callback_data: joinData }]];
    return inline_keyboard;
  }
};

bot.on('text', ctx => {
  const text = ctx.message.text;
  const command = text.split(' ');
  const firstPart = command[0];
  const secondPart = command[1];
  const chatID = ctx.message.chat.id;
  const username = ctx.message.from.username;
  const inline_keyboard = start(firstPart, secondPart, chatID, username);
  const keyboard = genKeyboard(inline_keyboard);
  ctx.reply('Current users:\n' + username + '\n', keyboard);
});



const addUser = (users, username, game, gameID, chatID, messageID) => {
  if (!users.includes(username)) {
    users.push(username);
    game = matrixCreate(game); // create matrix
    const joinData = `${gameID}:addUser:${username}`;
    const inline_keyboard = [[{ text: 'Join!', callback_data: joinData }]];
    if (users.length >= 2) {
      const startData = `${gameID}:startGame:${username}`;
      inline_keyboard.push([{ text: 'Start!', callback_data: startData }]);
    }
    const keyboard = genKeyboard(inline_keyboard);
    const user = 'Players:\n' + users.join('\n');
    bot.telegram.editMessageText(chatID, messageID, undefined, user, keyboard);
  }
};
const startGame = (users, game, gameID, chatID, messageID) => {
  const currUser = users[randomInt(0, users.length - 1)];
  game.turn = currUser;
  const inline_keyboard = [];
  for (let i = 0; i < game.N; i++) {
    inline_keyboard.push([]);
    for (let j = 0; j < game.N; j++) {
      const crossData = (`${gameID}:addCross:${i}-${j}`).toString();
      inline_keyboard[i].push({ text: ' ', callback_data: crossData });
    }
  }
  const keyboard = genKeyboard(inline_keyboard);
  const vs = users.join(' vs ') + (`\nTurn: ${game.turn}`).toString();
  bot.telegram.editMessageText(chatID, messageID, undefined, vs, keyboard);
};
const turn = (isEnded, chatID, messageID, game, repeat, users, keyboard) => {
  if (isEnded) {
    const looseData = `${game.turn} has lost!`;
    bot.telegram.editMessageText(chatID, messageID, undefined, looseData);
    game = null;
  } else {
    if (!repeat) {
      game.turn = nextTurn(game.turn, users);
      const vs = users.join(' vs ') + (`\nTurn: ${game.turn}`).toString();
      bot.telegram.editMessageText(chatID, messageID, undefined, vs, keyboard);
    }
  }
};

const addCross = (game, username, queryData, gameID, chatID, messageID, users) => {
  if (game.turn === username) {
    const matrix = game.matrix;
    const repeat = matrixModify(queryData, matrix);
    const inline_keyboard = [];
    for (let i = 0; i < game.N; i++) {
      inline_keyboard.push([]);
      for (let j = 0; j < game.N; j++) {
        const crossData = (`${gameID}:addCross:${i}-${j}`).toString();
        const cross = matrix[i][j] ? '❌' : ' ';
        inline_keyboard[i].push({ text: cross, callback_data: crossData });
      }
    }
    const keyboard = genKeyboard(inline_keyboard);
    const isEnded = checker(matrix);
    turn(isEnded, chatID, messageID, game, repeat, users, keyboard);
  }
};

bot.on('callback_query', ctx => {
  const query = ctx.update.callback_query;
  const chatID = query.message.chat.id;
  const messageID = query.message.message_id;
  const username = query.from.username;
  const data = query.data.split(':');
  const gameID = +data[0];
  const queryFor = data[1];
  const queryData = data[2];
  const game = getGameById(gameID, chatID);
  console.log(data);
  if (game) {
    const users = game.users;
    console.log(game, game.N);
    if (queryFor === 'addUser') {
      addUser(users, username, game, gameID, chatID, messageID);
    } else if (queryFor === 'startGame' && users.includes(username)) {
      startGame(users, game, gameID, chatID, messageID);
    } else if (queryFor === 'addCross') {
      addCross(game, username, queryData, gameID, chatID, messageID, users);
    }
  }
});

bot.launch();
