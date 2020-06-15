'use strict';

const matrix = require('./matrixProcessing');
const constants = require('./config.js');
const fs = require('fs');
const { matrixModify, checker, matrixCreate } = matrix;
const { MAX_BUTTONS, MIN_BUTTONS } = constants;

function getGameById(gameID, chatID, CHATES) { //finds the right game
  if (CHATES[chatID]) {
    for (const id in CHATES[chatID].games) {
      if (id === gameID.toString()) return CHATES[chatID].games[id];
    }
  }
}
const replyFile = (ctx, file) => {
  ctx.reply(fs.readFileSync(file, 'utf8'));
}; //reply with a file

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

const genKeyboard = inlineKeyboard => ({
  'reply_markup': JSON.stringify({
    'inline_keyboard': inlineKeyboard,
  }),
});
//makes keyboard after /start_game
const start = (secondPart, chatID, username, CHATES) => {
  secondPart = processingNum(secondPart);
  if (!CHATES[chatID]) CHATES[chatID] = { games: {} };
  const currGameAmount = Object.keys(CHATES[chatID].games).length;
  CHATES[chatID].games[currGameAmount + 1] = {
    users: [username],
    N: secondPart,
  };
  const joinData = `${currGameAmount + 1}:addUser:${username}`;
  const inlineKeyboard = [[{ text: 'Join!', 'callback_data': joinData }]];
  return inlineKeyboard;
};

const addUser = obj => { //adds a user to the game
  if (!obj.users.includes(obj.username)) {
    obj.users.push(obj.username);
    obj.game = matrixCreate(obj.game); // create matrix
    const joinData = `${obj.gameID}:addUser:${obj.username}`;
    const inlineKeyboard = [[{ text: 'Join!', 'callback_data': joinData }]];
    if (obj.users.length >= 2) {
      const startData = `${obj.gameID}:startGame:${obj.username}`;
      inlineKeyboard.push([{ text: 'Start!', 'callback_data': startData }]);
    }
    const keyboard = genKeyboard(inlineKeyboard);
    const user = 'Players:\n' + obj.users.join('\n');
    obj.bot.telegram.editMessageText(obj.chatID, obj.messageID,
      undefined, user, keyboard);
  }
};

const startGame = obj => { //starts the game
  const random = randomInt(0, obj.users.length - 1);
  const currUser = obj.users[random];//first turn choosage
  obj.game.turn = currUser;
  const inlineKeyboard = [];
  for (let i = 0; i < obj.game.N; i++) {
    inlineKeyboard.push([]);
    for (let j = 0; j < obj.game.N; j++) {
      const crossData = `${obj.gameID}:addCross:${i}-${j}`.toString();
      inlineKeyboard[i].push({ text: ' ', 'callback_data': crossData });
    }
  }
  const keyboard = genKeyboard(inlineKeyboard);
  const vs = obj.users.join(' vs ') + `\nTurn: ${obj.game.turn}`.toString();
  obj.bot.telegram.editMessageText(obj.chatID, obj.messageID,
    undefined, vs, keyboard);
};

const turn = (isEnded, obj, keyboard, repeat) => { //next turn
  if (isEnded) {
    const looseData = `${obj.game.turn} has lost!`;
    obj.bot.telegram.editMessageText(obj.chatID, obj.messageID,
      undefined, looseData);
    obj.game = null;
  } else if (!repeat) {
    obj.game.turn = nextTurn(obj.game.turn, obj.users);
    const vs = obj.users.join(' vs ') + `\nTurn: ${obj.game.turn}`.toString();
    obj.bot.telegram.editMessageText(obj.chatID, obj.messageID,
      undefined, vs, keyboard);
  }
};

const addCross = obj => { //ads a cross
  if (obj.game.turn === obj.username) {
    const matrix = obj.game.matrix;
    const coords = obj.queryData.split('-');
    const repeat = matrixModify(coords, matrix);
    const inlineKeyboard = [];
    for (let i = 0; i < obj.game.N; i++) {
      inlineKeyboard.push([]);
      for (let j = 0; j < obj.game.N; j++) {
        const crossData = `${obj.gameID}:addCross:${i}-${j}`.toString();
        const cross = matrix[i][j] ? '❌' : ' ';
        inlineKeyboard[i].push({ text: cross, 'callback_data': crossData });
      }
    }
    const keyboard = genKeyboard(inlineKeyboard);
    const isCornerInField = checker(matrix);
    const isEnded = isCornerInField(coords[0], coords[1]);
    console.log(coords[0], coords[1], isEnded, matrix);
    turn(isEnded, obj, keyboard, repeat);
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
