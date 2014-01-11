class Browser
  constructor: (stage, location, message, gold, experience, @b) ->
    @stage         = new Stage stage
    @location      = new Location location
    @message       = new Message message
    @gold          = new Gold gold
    @experience    = new Experience experience
    @key_listeners = []
    @listen()
    @render()
    @game = on

  render: =>
    @stage.render @b.view()
    @location.render @b.name
    @gold.render @b.characters[@b.player].gold
    @experience.render @b.characters[@b.player].experience

  register_key_listener: (o) ->
    @key_listeners.push(o)

  listen: ->
    $(window).on 'keydown', @propagate_key

  propagate_key: (e) =>
    if e.shiftKey is on
      switch e.keyCode
        when 188 then key = '<'
        when 190 then key = '>'
        else return
    else
      switch e.keyCode
        when 37, 72 then key = 'left'
        when 39, 76 then key = 'right'
        when 38, 75 then key = 'up'
        when 40, 74 then key = 'down'
        else return
    l.handle_key @b, key for l in @key_listeners
    if @game is on
      @render()

  game_over: (p) =>
    $(window).off 'keydown', @propagate_key
    @stage.render '<h1 id="game-over">Game Over</h1>'
    @game = off
    @message.game_over @b.state[p.y][p.x]

