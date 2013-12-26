class Basement
  constructor: (@name, dimensions) ->
    @width = dimensions.width
    @height = dimensions.height
    @state = []
    @characters = {}

  generate: ->
    for y in [0..@height]
      @state[y] = []
      for x in [0..@width]
        @state[y][x] = '.'
    @perimeter_wall()

  perimeter_wall: ->
    for x in [0..@width]
      @state[0][x] = '#'
      @state[@height][x] = '#'
    
    for y in [0..@height]
      @state[y][0] = '#'
      @state[y][@width] = '#'

  down_stairs: (p) ->
    @state[p.y][p.x] = '>'

  up_stairs: (p) ->
    @state[p.y][p.x] = '<'

  spawn: (character) ->
    p = character.position
    @characters[character.name] = character
    @state[p.y][p.x] = character.symbol

  set_player: (character) ->
    p = character.position
    @characters[character.name] = character
    @player = character.name
    @state[p.y][p.x] = character.symbol


  move: (character, direction) ->
    c = @characters[character]
    p1 = {x: c.position.x, y: c.position.y}
    @state[p1.y][p1.x] = '.'

    c.move(direction)
    p2 = {x: c.position.x, y: c.position.y}

    if @state[p2.y][p2.x] isnt '#'
      c.position = p2
    else
      c.position = p1

    @state[c.position.y][c.position.x] = c.symbol

  view: ->
    view = ''
    for y in [0..@height]
      for x in [0..@width]
        view += @format @state[y][x]
      view += '<br />'

    return view

  format: (char) ->
    switch char
      when '.' then c = ['space']
      when '#' then c = ['wall']
      when '@' then c = ['player']
      when 'T' then c = ['troll']
      when 'G' then c = ['goblin']
      when '>' then c = ['down', 'stairs']
      when '<' then c = ['up', 'stairs']

    return "<span class=\"#{ c.join(' ') }\">#{ char }</span>"

