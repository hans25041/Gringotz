main = ->
  b1 = build_basement()
  setTimeout -> first_move b1, 500

build_basement = ->
  b1 = new Basement {width: 80, height: 20}

  crok = new Troll 'Crok', {x: 1, y: 2}
  griphook = new Goblin 'Griphook', {x: 3, y: 4}
  harry = new Player {x: 10, y: 10}

  b1.generate()

  b1.spawn crok
  b1.spawn griphook
  b1.spawn harry
  b1.down_stairs {x: 20, y: 18}

  b1.print()
  return b1

first_move = (b1) ->
  b1.clear()

  b1.move 'Crok', 'down'
  b1.move 'Griphook', 'right'
  b1.move 'harry', 'up'
  
  b1.print()

main()
