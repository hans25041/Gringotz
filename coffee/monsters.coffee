class Monster extends Character
  constructor: (@name, @position) ->

class Troll extends Monster
  constructor: (@name, @position) ->
    @symbol = 'T'

class Goblin extends Monster
  constructor: (@name, @position) ->
    @symbol = 'G'

