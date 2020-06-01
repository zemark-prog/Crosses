# Crosses-Crosses

This bot was created for playing own-developed game Crosses-Crosses.
The game can be played by 2 or more players on the square board with a side from 4 to 8.
In the end of the game the bot will tell the looser. Enjoy this interesting game.

## API/Frameworks
* Telegraf

## How to use it
You need to add this bot to the group. Then write /start_game n where n is optional parameter of the board side(default value of n is 4).After creating people would be able to join the game by clicking the button 'Join!'. When there would be 2 or more players the button 'Start' will appear. Only players who joined the game are able to start it. It could be many games at the same chat simultaneously. The person whose turn is first is choosen randomly.

## Rules
The players play the game on a board consisting of n columns by n
rows. They have to put a cross in one of the cells so that the four crosses are not in
the vertices of any rectangle the sides of which are parallel to the sides of the
board. The player who made a rectangle is the loser.

## Installation
1. Clone this repository
```
git clone https://github.com/zemark-prog/Crosses-Crosses-Bot.git
```
2. In file modules/config.js change variable:
const TOKEN = <YOUR_BOT_TOKEN>;

## Help
Ask questions at [telegram](https://t.me/zemark_ua) and post issues at [github](https://github.com/zemark-prog/Crosses-Crosses-Bot/issues)

## License
ISC © [Mark Zegelman](https://github.com/zemark-prog)
