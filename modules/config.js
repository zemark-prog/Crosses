'use strict';

require('dotenv').config();
const MAX_BUTTONS = 8;
const MIN_BUTTONS = 4;
const TOKEN = process.env.BOT_TOKEN;
const BOT_URL = process.env.BOT_URL;

module.exports = {
  MAX_BUTTONS,
  MIN_BUTTONS,
  TOKEN,
  BOT_URL,
};
