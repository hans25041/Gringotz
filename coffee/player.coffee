class Player extends Character
  constructor: (@name, @position) ->
    @symbol = '@'
    @directions = ['up', 'down', 'left', 'right']
    @death_listeners = []

  register_death_listener: (o) ->
    @death_listeners.push(o)

  handle_key: (b, key) ->
    if key in @directions
      b.move @name, key, @check_move

  check_move: (state, p1, p2) =>
    target = state[p2.y][p2.x]
    switch target
      when '#' then @position = p1
      when 'T' then @die(p2)
      else
        state[p1.y][p1.x] = '.'
        state[p2.y][p2.x] = '@'

  die: (p) ->
    l.player_died(p) for l in @death_listeners
