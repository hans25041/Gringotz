class Message
  constructor: (@el) ->

  render: (message) ->
    @el.html message

  game_over: (killer) ->
    switch killer
      when 'T' then message = 'A troll mercilessly beat you to death. It was quite aweful.'
      when 'G' then message = 'A goblin killed you.'

    @render message
