/*jslint indent: 2*/
/*global $, document*/
(function () {
  "use strict";

  var sprites,
      player,
      listeners,
      screen,
      spells,
      monsters;

  function main() {
    screen.init();
    screen.load(1);
  }

  $(document).ready(function () {
    main();
  });

  var sprites = {
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
        sprite = sprites.v_locked_door;
        break;
      case '-':
        sprite = sprites.h_locked_door;
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
      case 'T':
        sprite = sprites.troll;
        break;

      // Default
      default:
        sprite = sprites.space;
        break;
      }
      return sprite;
    },

    player:        '<span class="player">@</span>',
    wall:          '<span class="wall">#</span>',
    space:         '<span class="space">.</span>',
    v_locked_door: '<span class="door">|</span>',
    h_locked_door: '<span class="door">-</span>',
    gold:          '<span class="gold">g</span>',
    stairs_down:   '<span class="stairs">&gt;</span>',
    stairs_up:     '<span class="stairs">&lt;</span>',
    hole:          '<span class="hole">&nbsp;</span>',
    troll:         '<span class="troll">T</span>'
  };

  player = {
    position: {x: 1, y: 1},
    gold: 0,
    experience: 0,
    incanting: false,
    move: function (key) {
      var origin_x = player.position.x,
          origin_y = player.position.y;

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
      case '>':
        player.climb_down();
        break;
      case '<':
        player.climb_up();
        break;
      case 'i':
        player.incantation();
        break;
      case 'help':
        screen.show_help();
        break;
      case 'peruse':
        screen.show_spellbook();
        break;
      }

      var player_on = screen.get_character(player.position)

      screen.messages.text('');

      if (player_on === '#') {
        player.position = {x: origin_x, y: origin_y};
        screen.messages.text('You cannot walk through walls.');
      }

      if (player_on === '|' || player_on === '-') {
        player.position = {x: origin_x, y: origin_y};
        screen.messages.text('You cannot walk through locked doors.');
      }

      if (player_on === ' ') {
        screen.messages.text('You fell in a hole and died.');
        screen.game_over();
        return;
      }

      if (player_on === 'T') {
        monsters.troll.kill();
        return;
      }

      if (player_on === 'm') {
        screen.messages.text('You were attacked by a monster and died.');
        screen.game_over();
        return;
      }

      if (player_on === 'g') {
        player.gold += 1;
      }

      if (screen.format[origin_y][origin_x] === 'g') {
        screen.format[origin_y][origin_x] = '.';
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

    term_incant: function() {
      $(document).off('keypress', player.incant);
      $('#incantation-input').val('');
      screen.incantation.addClass('hide');
      player.incanting = false;
    },

    incant: function (e) {
      if (e.keyCode !== 13) return;
      var spell = $('#incantation-input').val().toLowerCase();
      $('#incantation-input').val('');
      if (spell in spells) {
        spells[spell]();
        player.term_incant()
      } else {
        screen.messages.text(spell + ' is not a known spell.');
        player.term_incant()
      }
    },

    check_adjacent: function (character) {
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
    },

    check_row_and_column: function() {
      var x,
        y;

      for (y = 0; y < screen.state.length; y += 1) {
        x = player.position.x;
        if (screen.state[y][x] === 'T') {
          return {x: x, y: y};
        }
      }

      for (x = 0; x < screen.state[0].length; x += 1) {
        y = player.position.y;
        if (screen.state[y][x] === 'T') {
          return {x: x, y: y};
        }
      }
    }
  };

  monsters = {
    visible: [],
    move_interval: null,

    init: function() {
      var y,
          x;

      for (y = 0; y < screen.state.length; y += 1) {
        screen.view[y] = [];
        for (x = 0; x < screen.state[y].length; x += 1) {
          switch (screen.state[y][x]) {
            case 'T':
              monsters.register('T', {x: x, y: y});
              break;
            default:
              break;
          }
        }
      }

      monsters.move_interval = setInterval(monsters.move, 300);

    },

    pause: function() {
      clearInterval(monsters.move_interval);
    },

    resume: function() {
      monsters.move_interval = setInterval(monsters.move, 300);
    },

    register: function (character, position) {
      var m = {character: character, position: position};
      switch (m.character) {
        case 'T':
          m.move         = monsters.troll.move;
          m.trajectories = monsters.troll.trajectories;
          m.trajectory   = 0;
          break;
      }
      monsters.visible.push(m);
    },

    move: function() {
      var i,
        m;

      for (i = 0; i < monsters.visible.length; i += 1) {
        m = monsters.visible[i];
        m.move(m);
      }
      screen.refresh();
      screen.render();
    },

    remove: function(p) {
      var i;
      var mp;
      for (i = 0; i < monsters.visible.length; i += 1) {
        mp = monsters.visible[i].position;
        if (mp.x === p.x && mp.y === p.y) {
          monsters.visible.splice(i, 1)
          screen.state[p.y][p.x] = '.';
        }
      }
    },

    troll: {
      trajectories: [
        {x: -1, y: 0},
        {x:  1, y: 0},
        {x:  0, y: -1},
        {x:  0, y:  1},
      ],

      move: function(m) {
        var test_p,
            test_c,
            t;

        t = this.trajectories[this.trajectory];
        test_p = {x: m.position.x + t.x, y: m.position.y + t.y};
        test_c = screen.get_character(test_p)

        if (test_c === '@') {
          monsters.troll.kill();
        }

        if (test_c === '#' || test_c === '-' || test_c === '|') {
          if (this.trajectory < 3) {
            this.trajectory += 1;
          } else {
            this.trajectory = 0;
          }
          return this.move(m);
        }

        if (screen.format[m.position.y][m.position.x] === 'T') {
          screen.format[m.position.y][m.position.x] = '.';
        }

        screen.state[m.position.y][m.position.x] = screen.format[m.position.y][m.position.x];
        m.position = test_p;
        screen.state[m.position.y][m.position.x] = m.character;

      },

      kill: function() {
        screen.messages.text('A troll mercilessly beat you to death. It was quite aweful.');
        screen.game_over();
      }

    }
  };

  spells = {
    alohamora: function() {
      var doors,
        i,
        l;

      doors = player.check_adjacent('|').concat(player.check_adjacent('-'));
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
    },

    stupify_check: function(t) {
      if (t.y < 0 ||
          t.x < 0 ||
          t.y >= screen.state.length ||
          t.x >= screen.state[t.y].length ) return 0;

      if ( screen.state[t.y][t.x] === '#' ||
           screen.state[t.y][t.x] === '-' ||
           screen.state[t.y][t.x] === '|' ) {
        return -1;
      }

      if (screen.state[t.y][t.x] === 'T') {
        monsters.remove(t);
        player.experience += 2;
        return 1
      }

      return 0;
    },

    stupify: function() {
      monsters.pause();
      var
          i,
          m,
          p = player.position,
          r = (player.experience + 1) * 2;


      for (i = 1; i <= r; i += 1) {
        switch (spells.stupify_check({x: p.x, y: p.y + i}, screen)) {
          case 1:
            monsters.resume();
            return true;
          case -1:
            break;
          default:
            continue;
        }
      }

      for (i = 1; i <= r; i += 1) {
        switch (spells.stupify_check({x: p.x, y: p.y - i}, screen)) {
          case 1:
            monsters.resume();
            return true;
          case -1:
            break;
          default:
            continue;
        }
      }

      for (i = 1; i <= r; i += 1) {
        switch (spells.stupify_check({x: p.x + i, y: p.y}, screen)) {
          case 1:
            monsters.resume();
            return true;
          case -1:
            break;
          default:
            continue;
        }
      }

      for (i = 1; i <= r; i += 1) {
        switch (spells.stupify_check({x: p.x - i, y: p.y}, screen)) {
          case 1:
            monsters.resume();
            return true;
          case -1:
            break;
          default:
            continue;
        }
      }

      monsters.resume();
    }
  }

  listeners = {
    keydown: function (e) {
      var key;
      if (player.incanting === true) {
        if (e.keyCode === 27 ) player.term_incant();
        return;
      }
      if (screen.helping === true) {
        if (e.keyCode === 27 ) screen.dismiss_help();
        return;
      }
      if (screen.perusing === true) {
        if (e.keyCode === 27 ) screen.dismiss_spellbook();
        return;
      }
      console.log(e.keyCode);
      switch (e.keyCode) {
      case 81:
        key = 'help';
        break;
      case 80:
        key = 'peruse';
        break;
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
      case 190:
        if (e.shiftKey === true) {
          key = '>';
        }
        break;
      case 188:
        if (e.shiftKey === true) {
          key = '<';
        }
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
    over: false,
    helping: false,
    perusing: false,

    init: function () {
      // Get a handle on the stage.
      screen.stage       = $('#stage');
      screen.messages    = $('#messages');
      screen.location    = $('#location');
      screen.gold        = $('#gold');
      screen.experience  = $('#experience');
      screen.help_hint   = $('#help-hint');
      screen.spell_hint  = $('#spell-hint');
      screen.incantation = $('#incantation');
      screen.help        = $('#help');
      screen.spellbook   = $('#spellbook');

      // Set listeners
      $(document).keydown(listeners.keydown);

    },

    show_help: function() {
      screen.helping = true;
      monsters.pause();
      screen.help.removeClass('hide');
    },

    dismiss_help: function() {
      screen.helping = false;
      monsters.resume();
      screen.help.addClass('hide');
    },

    show_spellbook: function() {
      screen.perusing = true;
      monsters.pause();
      screen.spellbook.removeClass('hide');
    },

    dismiss_spellbook: function() {
      screen.perusing = false;
      monsters.resume();
      screen.spellbook.addClass('hide');
    },

    get_character: function(p) {
      return screen.state[p.y][p.x];
    },

    load: function (basement) {
      screen.basement = basement;

      $.ajax({
        url: 'levels/' + screen.basement.toString(),
        success: function (l) {
          var format,
              state,
              i;


          // Remove monsters
          monsters.visible = []

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
          monsters.init();

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

      if (screen.over === true) {
        return false;
      }

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
      screen.help_hint.html('<span class="label">Tap q for help.</span>')
      screen.spell_hint.html('<span class="label">Tap p to peruse the spellbook</span>')

    },

    game_over: function() {
      $(document).off('keydown');
      screen.over = true;
      screen.stage.html('<h1 id="game-over">Game Over</h1>');
    }
  };

}());
