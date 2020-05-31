'use strict';

require('dotenv').config();
const MAX_BUTTONS = 8;
const MIN_BUTTONS = 4;
const TOKEN = process.env.KEY;


module.exports = {
  MAX_BUTTONS,
  MIN_BUTTONS,
  TOKEN,
};