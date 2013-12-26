class Player extends Character
  constructor: (@name, @position) ->
    @symbol = '@'
    @directions = ['up', 'down', 'left', 'right']

  handle_key: (b, key) ->
    if key in @directions
      b.move @name, key
