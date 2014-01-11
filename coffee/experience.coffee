class Experience
  constructor: (@el) ->

  render: (count) ->
    @el.html "<span class=\"label\">Experience</span><span class=\"value\">#{ count }</span>"

