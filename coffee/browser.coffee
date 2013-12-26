class Browser
  constructor: (stage, location, @b) ->
    @stage = new Stage stage
    @location = new Location location
    @listeners = []
    @listen()
    @interval = setInterval @render, 500

  render: =>
    @stage.render @b.view()
    @location.render @b.name

  register_listener: (o) ->
    @listeners.push(o)

  listen: ->
    $(window).keydown @propagate_key

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
    l.handle_key @b, key for l in @listeners
    @render()

