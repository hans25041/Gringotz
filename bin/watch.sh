#!/bin/bash

nodejs /usr/bin/coffee --watch \
  --join js/gringotz.js \
  --compile \
    coffee/browser.coffee \
    coffee/message.coffee \
    coffee/location.coffee \
    coffee/stage.coffee \
    coffee/basement.coffee \
    coffee/character.coffee \
    coffee/monsters.coffee \
    coffee/player.coffee \
    coffee/main.coffee
