class Gold
  constructor: (@el) ->

  render: (count) ->
    @el.html "<span class=\"label\">Gold</span><span class=\"value\">#{ count }</span>"

