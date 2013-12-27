class Message
  constructor: (@el) ->

  render: (message) ->
    @el.html message

  game_over: (killer) ->
    switch killer
      when 'T' then message = 'You were killed by a Troll. It was quite aweful.'

    @render message
