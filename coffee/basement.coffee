class Basement
  constructor: (dimensions) ->
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

  move: (character, direction) ->
    c = @characters[character.name]
    p = c.position
    @state[p.y][p.x] = '.'

    c.move(direction)
    p = c.position
    @state[p.y][p.x] = c.symbol

  print: ->
    console.log row.join('') for row in @state

  clear: ->
    process.stdout.write '\u001B[2J\u001B[0;0f'

