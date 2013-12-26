class Location
  constructor: (@el) ->

  render: (name) ->
    @el.html "<span class=\"label\">Location</span><span class=\"value\">#{ name }</span>"

