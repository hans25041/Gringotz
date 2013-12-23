(function() {
  "use strict"

  $(document).ready(function() {
    main();
  });

  function main() {
    screen.init();
    screen.load(1);
  }

  var sprites = {
    format: function(character) {
      var sprite;
      switch(character) {
        case '#':
          sprite = sprites.wall;
          break;
        case '@':
          sprite = sprites.player;
          break;
        case '>':
          sprite = sprites.stairs_down;
          break;
        case '<':
          sprite = sprites.stairs_up;
          break;
        case '|':
          sprite = sprites.closed_door;
          break;
        case 'g':
          sprite = sprites.gold;
          break;
        case '.':
        default:
          sprite = sprites.space;
          break;
      }
      return sprite;
    },

    player:      '<span class="player">@</span>',
    wall:        '<span class="wall">#</span>',
    space:       '<span class="space">.</span>',
    closed_door: '<span class="door">|</span>',
    gold:        '<span class="gold">g</span>',
    stairs_down: '<span class="stairs">&gt;</span>',
    stairs_up:   '<span class="stairs">&lt;</span>'
  };

  var player = {
    position: {x:1, y:1},
    gold: 0,
    move: function(key) {
      var origin_x = player.position.x,
          origin_y = player.position.y;

      screen.messages.text('');

      switch (key) {
        case 'up':
          player.position.y--;
          break;
        case 'down':
          player.position.y++;
          break;
        case 'left':
          player.position.x--;
          break;
        case 'right':
          player.position.x++;
          break;
        case 'd':
          player.climb_down();
          break;
        case 'u':
          player.climb_up();
          break;
      }

      if (screen.format[player.position.y][player.position.x] === '#') {
        player.position = {x: origin_x, y: origin_y};
        screen.messages.text('You cannot walk through walls.');
      }

      if (screen.format[player.position.y][player.position.x] === '|') {
        player.position = {x: origin_x, y: origin_y};
        screen.messages.text('You cannot walk through closed doors.');
      }

      if (screen.format[origin_y][origin_x] === '@') {
        screen.format[origin_y][origin_x] = '.';
      }

      if (screen.format[origin_y][origin_x] === 'g') {
        screen.format[origin_y][origin_x] = '.';
        player.gold += 1;
      }

      screen.state[origin_y][origin_x] = screen.format[origin_y][origin_x];
      screen.state[player.position.y][player.position.x] = '@';
    },

    climb_down: function() {
      if (screen.format[player.position.y][player.position.x] !== '>') {
        screen.messages.text('Must be on > to climb down stairs.');
        return;
      }

      screen.messages.text('Climbing down stairs.');
      screen.load(screen.level + 1);
    },

    climb_up: function() {
      if (screen.format[player.position.y][player.position.x] !== '<') {
        screen.messages.text('Must be on < to climb up stairs.');
        return;
      }

      screen.messages.text('Climbing up stairs.');
      screen.load(screen.level - 1);
    }

  };

  var listeners = {
    keydown: function(e) {
      var key;
      switch (e.keyCode) {
        case 37:
          key = 'left';
          break;
        case 38:
          key = 'up';
          break;
        case 39:
          key = 'right';
          break;
        case 40:
          key = 'down';
          break;
        case 68:
          key = 'd';
          break;
        case 85:
          key = 'u';
          break;
      }
      player.move(key);
      screen.refresh();
      screen.render();
    },
  };

  var screen = {
    stage: null,
    view: [],
    format: [],
    state: [],
    width: 0,
    height: 0,

    init: function(width, height) {
      
      // Get a handle on the stage.
      screen.stage    = $('#stage');
      screen.messages = $('#messages');
      screen.location = $('#location');
      screen.gold     = $('#gold');

      // Set listeners
      $(document).keydown(listeners.keydown);

    },

    load: function(level) {
      screen.level = level;

      $.ajax({
        url: 'levels/'+screen.level.toString(),
        success: function(l) {
          var format,
              state,
              i,
              y,
              x;

          // Load level format.
          format = l.split(/\n/);
          state = l.split(/\n/);
          for (i in format) {
            format[i] = format[i].split('');
            state[i]  = state[i].split('');
          }
          screen.format = format;
          screen.state  = state;

          screen.state[player.position.y][player.position.x] = '@';

          // Render
          screen.render();
        },
        error: function(a, b, c) {
          console.log(a);
          console.log(b);
          console.log(c);
        }
      });
    },

    refresh: function() {
      var y,
          x;

      for (y = 0; y < screen.height; y++) {
        screen.view[y] = [];
        for (x = 0; x < screen.width; x++) {
          screen.view[y][x] = sprites.get(x,y);
        }
      }
    },

    render: function() {

      var y,
          x,
          row;
      
      // Prepare view
      for (y in screen.state) {
        screen.view[y] = [];
        for (x in screen.state[y]) {
          screen.view[y][x] = sprites.format(screen.state[y][x]);
        }
      }
          
      // Render the view.
      screen.stage.empty();
      for (row in screen.view) {
        screen.stage.append(screen.view[row].join('')+'<br />');
      }

      screen.gold.html('<span class="label">Gold:</span><span class="value">'+player.gold.toString()+'</span>');
      screen.location.html('<span class="label">Location:</span><span class="value">B'+screen.level.toString()+'</span>');

    }
  };


})();
