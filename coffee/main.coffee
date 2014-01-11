main = ->
  b1 = build_basement()
  b = new Browser $('#stage'), $('#location'), $('#messages'), $('#gold'), $('#experience'), b1
  p = b1.characters[b1.player]
  b.register_key_listener p
  p.register_death_listener b

build_basement = ->
  b1 = new Basement 'B1', {width: 80, height: 20}

  crok = new Troll 'Crok', {x: 1, y: 2}
  griphook = new Goblin 'Griphook', {x: 3, y: 4}
  harry = new Player 'Harry', {x: 10, y: 10}

  b1.generate()

  b1.spawn crok
  b1.spawn griphook
  b1.set_player harry
  b1.down_stairs {x: 20, y: 18}

  return b1

first_move = (b, b1) ->

  b1.move 'Crok', 'down'
  b1.move 'Griphook', 'right'
  b1.move 'Harry', 'up'

$(document).ready ->
  main()
