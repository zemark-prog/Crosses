'use strict';

const Telegraf = require('telegraf');
const CONSTANTS = require('./modules/config.js');
const FUNCTIONS = require('./modules/functions.js');
const { TOKEN } = CONSTANTS;
const {replyFile, getGameById, start, addUser, startGame, addCross, genKeyboard } = FUNCTIONS;

const bot = new Telegraf(TOKEN);

bot.telegram.setWebhook(`${BOT_URL}/bot${TOKEN}`);
bot.startWebhook(`/bot${TOKEN}`, null, process.env.PORT);

const CHATES = {};


bot.help(ctx => replyFile(ctx, './texts/help.txt'));
bot.command('rules', ctx => replyFile(ctx, './texts/rules.txt'));
bot.on('text', ctx => {
  const text = ctx.message.text;
  const command = text.split(' ');
  const firstPart = command[0];
  const secondPart = command[1];
  if (firstPart === '/start_game' || firstPart === '/start_game@CrossesCrossesBot') {
    const chatID = ctx.message.chat.id;
    const username = ctx.message.from.username;
    const inline_keyboard = start(secondPart, chatID, username, CHATES);
    const keyboard = genKeyboard(inline_keyboard);
    ctx.reply('Current users:\n' + username + '\n', keyboard);
  }
});

bot.on('callback_query', ctx => {
  const query = ctx.update.callback_query;
  const chatID = query.message.chat.id;
  const messageID = query.message.message_id;
  const username = query.from.username;
  const data = query.data.split(':');
  const gameID = +data[0];
  const queryFor = data[1];
  const queryData = data[2];
  const game = getGameById(gameID, chatID, CHATES);
  console.log(data);
  if (game) {
    const users = game.users;
    console.log(game, game.N);
    if (queryFor === 'addUser') {
      addUser(users, username, game, gameID, chatID, messageID, bot);
    } else if (queryFor === 'startGame' && users.includes(username)) {
      startGame(users, game, gameID, chatID, messageID, bot);
    } else if (queryFor === 'addCross') {
      addCross(game, username, queryData, gameID, chatID, messageID, users, bot);
    }
  }
});
