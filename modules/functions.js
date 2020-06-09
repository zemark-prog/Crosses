'use strict';

const MATRIX = require('./matrixProcessing');
const CONSTANTS = require('./config.js');
const fs = require('fs');
const { matrixModify, checker, matrixCreate } = MATRIX;
const { MAX_BUTTONS, MIN_BUTTONS } = CONSTANTS;

function getGameById(gameID, chatID, CHATES) { //finds the right game
  if (CHATES[chatID]) {
    for (const id in CHATES[chatID].games) {
      if (id === gameID.toString()) return CHATES[chatID].games[id];
    }
  }
}
const replyFile = (ctx, file) => ctx.reply(fs.readFileSync(file, 'utf8'));//reply with a file

function nextTurn(currUser, users) { //returns user whose turn is next
  let index = users.indexOf(currUser);
  return users[++index >= users.length ? 0 : index];
}

function randomInt(min, max) { //random function
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

const processingNum = secondPart => { //processing the side size
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

const start = (secondPart, chatID, username, CHATES) => {//makes keyboard after /start_game
  secondPart = processingNum(secondPart);
  if (!CHATES[chatID]) CHATES[chatID] = { games: {} };
  const currGameAmount = Object.keys(CHATES[chatID].games).length;
  CHATES[chatID].games[currGameAmount + 1] = { };
  CHATES[chatID].games[currGameAmount + 1].users = [username];
  CHATES[chatID].games[currGameAmount + 1].N = secondPart;
  const joinData = `${currGameAmount + 1}:addUser:${username}`;
  const inline_keyboard = [[{ text: 'Join!', callback_data: joinData }]];
  return inline_keyboard;
};

const addUser = (users, username, game, gameID, chatID, messageID, bot) => {//adds a user to the game
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

const startGame = (users, game, gameID, chatID, messageID, bot) => {//starts the game
  const currUser = users[randomInt(0, users.length - 1)];//first turn choosage
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

const turn = (isEnded, chatID, messageID, game, repeat, users, keyboard, bot) => {//next turn
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

const addCross = (game, username, queryData, gameID, chatID, messageID, users, bot) => {//ads a cross
  if (game.turn === username) {
    const matrix = game.matrix;
    const coords = queryData.split('-');
    const repeat = matrixModify(coords, matrix);
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
    const isCornerInField = checker(matrix)
    const isEnded = isCornerInField(coords[0], coords[1]);
    turn(isEnded, chatID, messageID, game, repeat, users, keyboard, bot);
  }
};

module.exports = {
  replyFile,
  getGameById,
  start,
  addUser,
  startGame,
  addCross,
  genKeyboard,
};
