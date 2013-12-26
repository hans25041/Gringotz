class Character
  constructor: (@position) ->

  move: (direction) ->
    switch direction
      when 'up' then @position.y -= 1
      when 'down' then @position.y += 1
      when 'left' then @position.x -= 1
      when 'right' then @position.x += 1

