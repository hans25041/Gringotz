class Player extends Character
  constructor: (@name, @position) ->
    @symbol = '@'
    @directions = ['up', 'down', 'left', 'right']
    @death_listeners = []
    @gold = 0
    @experience = 0

  register_death_listener: (o) ->
    @death_listeners.push(o)

  handle_key: (b, key) ->
    if key in @directions
      b.move @name, key, @check_move

  check_move: (state, p1, p2) =>
    target = state[p2.y][p2.x]
    switch target
      when '#' then @position = p1
      when '|' then @position = p1
      when 'g'
        @gold += 1
        @_move state, p1, p2
      when 'T','G' then @die(p2)
      else @_move state, p1, p2

  _move: (s, p1, p2) ->
    s[p1.y][p1.x] = '.'
    s[p2.y][p2.x] = '@'

  die: (p) ->
    l.game_over(p) for l in @death_listeners
