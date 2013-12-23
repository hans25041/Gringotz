/*jslint indent: 2*/
/*global $, document*/
(function () {
  "use strict";

  var sprites,
    player,
    listeners,
    screen,
    spells;

  function main() {
    screen.init();
    screen.load(1);
  }

  $(document).ready(function () {
    main();
  });

  sprites = {
    format: function (character) {
      var sprite;
      switch (character) {
      // Terrain
      case '.':
        sprite = sprites.space;
        break;
      case '#':
        sprite = sprites.wall;
        break;
      case '>':
        sprite = sprites.stairs_down;
        break;
      case '<':
        sprite = sprites.stairs_up;
        break;
      case '|':
        sprite = sprites.locked_door;
        break;
      case ' ':
        sprite = sprites.hole;
        break;

      // Items
      case 'g':
        sprite = sprites.gold;
        break;

      // Characters
      case '@':
        sprite = sprites.player;
        break;

      // Default
      default:
        sprite = sprites.space;
        break;
      }
      return sprite;
    },

    player:      '<span class="player">@</span>',
    wall:        '<span class="wall">#</span>',
    space:       '<span class="space">.</span>',
    locked_door: '<span class="door">|</span>',
    gold:        '<span class="gold">g</span>',
    stairs_down: '<span class="stairs">&gt;</span>',
    stairs_up:   '<span class="stairs">&lt;</span>',
    hole:        '<span class="hole">&nbsp;</span>'
  };

  player = {
    position: {x: 1, y: 1},
    gold: 0,
    experience: 0,
    incanting: false,
    move: function (key) {
      var origin_x = player.position.x,
        origin_y = player.position.y;

      screen.messages.text('');

      switch (key) {
      case 'up':
        player.position.y -= 1;
        break;
      case 'down':
        player.position.y += 1;
        break;
      case 'left':
        player.position.x -= 1;
        break;
      case 'right':
        player.position.x += 1;
        break;
      case 'd':
        player.climb_down();
        break;
      case 'u':
        player.climb_up();
        break;
      case 'i':
        player.incantation();
      }

      if (screen.state[player.position.y][player.position.x] === '#') {
        player.position = {x: origin_x, y: origin_y};
        screen.messages.text('You cannot walk through walls.');
      }

      if (screen.state[player.position.y][player.position.x] === '|') {
        player.position = {x: origin_x, y: origin_y};
        screen.messages.text('You cannot walk through locked doors.');
      }

      if (screen.state[player.position.y][player.position.x] === ' ') {
        screen.messages.text('You fell in a hole and died.');
        screen.game_over();
        return;
      }

      if (screen.format[origin_y][origin_x] === 'g') {
        screen.format[origin_y][origin_x] = '.';
        player.gold += 1;
      }

      screen.state[origin_y][origin_x] = screen.format[origin_y][origin_x];
      screen.state[player.position.y][player.position.x] = '@';
      screen.refresh();
      screen.render();
    },

    climb_down: function () {
      if (screen.format[player.position.y][player.position.x] !== '>') {
        screen.messages.text('Must be on > to climb down stairs.');
        return;
      }

      screen.messages.text('Climbing down stairs.');
      screen.load(screen.basement + 1);
    },

    climb_up: function () {
      if (screen.format[player.position.y][player.position.x] !== '<') {
        screen.messages.text('Must be on < to climb up stairs.');
        return;
      }

      screen.messages.text('Climbing up stairs.');
      screen.load(screen.basement - 1);
    },

    incantation: function () {
      screen.incantation.removeClass('hide');
      $('#incantation-input').focus();
      player.incanting = true;
      $(document).on('keypress', player.incant);
    },

    incant: function (e) {
      if (e.keyCode !== 13) return;
      var spell = $('#incantation-input').val().toLowerCase();
      $('#incantation-input').val('');
      if (spell in spells) {
        spells[spell]();
        $(document).off('keypress', player.incant);
        screen.incantation.addClass('hide');
        player.incanting = false;
      } else {
        screen.messages.text(spell + ' is not a known spell.');
      }
    },

    checkAdjacent: function (character) {
      var deltas = [],
        found = [],
        i,
        l;

      deltas = [
        {x: -1, y: -1},
        {x: -1, y:  0},
        {x: -1, y:  1},
        {x:  0, y: -1},
        {x:  0, y:  1},
        {x:  1, y: -1},
        {x:  1, y:  0},
        {x:  1, y:  1},
      ];

      for (i = 0; i < deltas.length; i += 1) {
        l = {
          x: player.position.x + deltas[i].x,
          y: player.position.y + deltas[i].y
        }
        if (screen.state[l.y][l.x] === character) {
          found.push(l);
        }
      }
      return found;
    }

  };

  spells = {
    alohamora: function() {
      var doors,
        i,
        l;

      doors = player.checkAdjacent('|');
      if (doors.length === 0) {
        screen.messages.text('No doors to unlock');
        return;
      }
      for (i = 0; i < doors.length; i += 1) {
        l = doors[i];
        screen.state[l.y][l.x] = '.';
        screen.format[l.y][l.x] = '.';
        player.experience += 1;
      }
      screen.messages.text('Unlock door');
      screen.render();
    }
  }

  listeners = {
    keydown: function (e) {
      var key;
      if (player.incanting === true) return;
      switch (e.keyCode) {
      case 72: // h
      case 37:
        key = 'left';
        break;
      case 75: // k
      case 38:
        key = 'up';
        break;
      case 76: // l
      case 39:
        key = 'right';
        break;
      case 74: // j
      case 40:
        key = 'down';
        break;
      case 68:
        key = 'd';
        break;
      case 85:
        key = 'u';
        break;
      case 73:
        key = 'i';
        e.preventDefault();
        break;
      }

      player.move(key);
    }
  };

  screen = {
    stage: null,
    view: [],
    format: [],
    state: [],
    width: 0,
    height: 0,
    basement: 0,

    init: function () {
      // Get a handle on the stage.
      screen.stage       = $('#stage');
      screen.messages    = $('#messages');
      screen.location    = $('#location');
      screen.gold        = $('#gold');
      screen.experience  = $('#experience');
      screen.incantation = $('#incantation');

      // Set listeners
      $(document).keydown(listeners.keydown);

    },

    load: function (basement) {
      screen.basement = basement;

      $.ajax({
        url: 'levels/' + screen.basement.toString(),
        success: function (l) {
          var format,
            state,
            i;

          // Load basement format.
          format = l.split(/\n/);
          state = l.split(/\n/);
          for (i = 0; i < format.length; i += 1) {
            format[i] = format[i].split('');
            state[i]  = state[i].split('');
          }
          screen.format = format;
          screen.state  = state;

          screen.state[player.position.y][player.position.x] = '@';

          // Render
          screen.render();
        },
        error: function (a, b, c) {
          console.log(a);
          console.log(b);
          console.log(c);
        }
      });
    },

    refresh: function () {
      var y,
        x;

      for (y = 0; y < screen.height; y += 1) {
        screen.view[y] = [];
        for (x = 0; x < screen.width; x += 1) {
          screen.view[y][x] = sprites.get(x, y);
        }
      }
    },

    render: function () {
      var y,
        x,
        row;

      // Prepare view
      for (y = 0; y < screen.state.length; y += 1) {
        screen.view[y] = [];
        for (x = 0; x < screen.state[y].length; x += 1) {
          screen.view[y][x] = sprites.format(screen.state[y][x]);
        }
      }

      // Render the view.
      screen.stage.empty();
      for (row = 0; row < screen.view.length; row += 1) {
        screen.stage.append(screen.view[row].join('') + '<br />');
      }

      screen.gold.html('<span class="label">Gold:</span><span class="value">' + player.gold.toString() + '</span>');
      screen.location.html('<span class="label">Location:</span><span class="value">B' + screen.basement.toString() + '</span>');
      screen.experience.html('<span class="label">Exp:</span><span class="value">' + player.experience.toString() + '</span>');

    },

    game_over: function() {
      screen.stage.html('<h1 id="game-over">Game Over</h1>');
    }
  };

}());
