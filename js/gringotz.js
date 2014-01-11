// Generated by CoffeeScript 1.6.3
(function() {
  var Basement, Browser, Character, Experience, Goblin, Gold, Location, Message, Monster, Player, Stage, Troll, build_basement, first_move, main,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Browser = (function() {
    function Browser(stage, location, message, gold, experience, b) {
      this.b = b;
      this.game_over = __bind(this.game_over, this);
      this.propagate_key = __bind(this.propagate_key, this);
      this.render = __bind(this.render, this);
      this.stage = new Stage(stage);
      this.location = new Location(location);
      this.message = new Message(message);
      this.gold = new Gold(gold);
      this.experience = new Experience(experience);
      this.key_listeners = [];
      this.listen();
      this.render();
      this.game = true;
    }

    Browser.prototype.render = function() {
      this.stage.render(this.b.view());
      this.location.render(this.b.name);
      this.gold.render(this.b.characters[this.b.player].gold);
      return this.experience.render(this.b.characters[this.b.player].experience);
    };

    Browser.prototype.register_key_listener = function(o) {
      return this.key_listeners.push(o);
    };

    Browser.prototype.listen = function() {
      return $(window).on('keydown', this.propagate_key);
    };

    Browser.prototype.propagate_key = function(e) {
      var key, l, _i, _len, _ref;
      if (e.shiftKey === true) {
        switch (e.keyCode) {
          case 188:
            key = '<';
            break;
          case 190:
            key = '>';
            break;
          default:
            return;
        }
      } else {
        switch (e.keyCode) {
          case 37:
          case 72:
            key = 'left';
            break;
          case 39:
          case 76:
            key = 'right';
            break;
          case 38:
          case 75:
            key = 'up';
            break;
          case 40:
          case 74:
            key = 'down';
            break;
          default:
            return;
        }
      }
      _ref = this.key_listeners;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        l.handle_key(this.b, key);
      }
      if (this.game === true) {
        return this.render();
      }
    };

    Browser.prototype.game_over = function(p) {
      $(window).off('keydown', this.propagate_key);
      this.stage.render('<h1 id="game-over">Game Over</h1>');
      this.game = false;
      return this.message.game_over(this.b.state[p.y][p.x]);
    };

    return Browser;

  })();

  Location = (function() {
    function Location(el) {
      this.el = el;
    }

    Location.prototype.render = function(name) {
      return this.el.html("<span class=\"label\">Location</span><span class=\"value\">" + name + "</span>");
    };

    return Location;

  })();

  Gold = (function() {
    function Gold(el) {
      this.el = el;
    }

    Gold.prototype.render = function(count) {
      return this.el.html("<span class=\"label\">Gold</span><span class=\"value\">" + count + "</span>");
    };

    return Gold;

  })();

  Experience = (function() {
    function Experience(el) {
      this.el = el;
    }

    Experience.prototype.render = function(count) {
      return this.el.html("<span class=\"label\">Experience</span><span class=\"value\">" + count + "</span>");
    };

    return Experience;

  })();

  Stage = (function() {
    function Stage(el) {
      this.el = el;
    }

    Stage.prototype.render = function(view) {
      return this.el.html(view);
    };

    return Stage;

  })();

  Message = (function() {
    function Message(el) {
      this.el = el;
    }

    Message.prototype.render = function(message) {
      return this.el.html(message);
    };

    Message.prototype.game_over = function(killer) {
      var message;
      switch (killer) {
        case 'T':
          message = 'A troll mercilessly beat you to death. It was quite aweful.';
          break;
        case 'G':
          message = 'A goblin killed you.';
      }
      return this.render(message);
    };

    return Message;

  })();

  Basement = (function() {
    function Basement(name, dimensions) {
      this.name = name;
      this.width = dimensions.width;
      this.height = dimensions.height;
      this.state = [];
      this.characters = {};
    }

    Basement.prototype.generate = function() {
      var x, y, _i, _j, _ref, _ref1;
      for (y = _i = 0, _ref = this.height; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
        this.state[y] = [];
        for (x = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
          this.state[y][x] = this.random();
        }
      }
      return this.perimeter_wall();
    };

    Basement.prototype.random = function() {
      var c, i;
      i = Math.floor(Math.random() * 4);
      switch (i) {
        case 1:
          c = '#';
          break;
        case 2:
          c = '|';
          break;
        case 3:
          c = 'g';
          break;
        default:
          c = '.';
      }
      return c;
    };

    Basement.prototype.perimeter_wall = function() {
      var x, y, _i, _j, _ref, _ref1, _results;
      for (x = _i = 0, _ref = this.width; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        this.state[0][x] = '#';
        this.state[this.height][x] = '#';
      }
      _results = [];
      for (y = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
        this.state[y][0] = '#';
        _results.push(this.state[y][this.width] = '#');
      }
      return _results;
    };

    Basement.prototype.down_stairs = function(p) {
      return this.state[p.y][p.x] = '>';
    };

    Basement.prototype.up_stairs = function(p) {
      return this.state[p.y][p.x] = '<';
    };

    Basement.prototype.spawn = function(character) {
      var p;
      p = character.position;
      this.characters[character.name] = character;
      return this.state[p.y][p.x] = character.symbol;
    };

    Basement.prototype.set_player = function(character) {
      var p;
      p = character.position;
      this.characters[character.name] = character;
      this.player = character.name;
      return this.state[p.y][p.x] = character.symbol;
    };

    Basement.prototype.move = function(character, direction, fn) {
      var c, p1, p2;
      c = this.characters[character];
      p1 = {
        x: c.position.x,
        y: c.position.y
      };
      c.move(direction);
      p2 = {
        x: c.position.x,
        y: c.position.y
      };
      return fn(this.state, p1, p2);
    };

    Basement.prototype.view = function() {
      var view, x, y, _i, _j, _ref, _ref1;
      view = '';
      for (y = _i = 0, _ref = this.height; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
        for (x = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
          view += this.format(this.state[y][x]);
        }
        view += '<br />';
      }
      return view;
    };

    Basement.prototype.format = function(char) {
      var c;
      switch (char) {
        case '.':
          c = ['space'];
          break;
        case '#':
          c = ['wall'];
          break;
        case '@':
          c = ['player'];
          break;
        case 'T':
          c = ['troll'];
          break;
        case 'G':
          c = ['goblin'];
          break;
        case '>':
          c = ['down', 'stairs'];
          break;
        case '<':
          c = ['up', 'stairs'];
          break;
        case '|':
          c = ['door'];
          break;
        case 'g':
          c = ['gold'];
      }
      return "<span class=\"" + (c.join(' ')) + "\">" + char + "</span>";
    };

    return Basement;

  })();

  Character = (function() {
    function Character(position) {
      this.position = position;
    }

    Character.prototype.move = function(direction) {
      switch (direction) {
        case 'up':
          return this.position.y -= 1;
        case 'down':
          return this.position.y += 1;
        case 'left':
          return this.position.x -= 1;
        case 'right':
          return this.position.x += 1;
      }
    };

    return Character;

  })();

  Monster = (function(_super) {
    __extends(Monster, _super);

    function Monster(name, position) {
      this.name = name;
      this.position = position;
    }

    return Monster;

  })(Character);

  Troll = (function(_super) {
    __extends(Troll, _super);

    function Troll(name, position) {
      this.name = name;
      this.position = position;
      this.symbol = 'T';
    }

    return Troll;

  })(Monster);

  Goblin = (function(_super) {
    __extends(Goblin, _super);

    function Goblin(name, position) {
      this.name = name;
      this.position = position;
      this.symbol = 'G';
    }

    return Goblin;

  })(Monster);

  Player = (function(_super) {
    __extends(Player, _super);

    function Player(name, position) {
      this.name = name;
      this.position = position;
      this.check_move = __bind(this.check_move, this);
      this.symbol = '@';
      this.directions = ['up', 'down', 'left', 'right'];
      this.death_listeners = [];
      this.gold = 0;
      this.experience = 0;
    }

    Player.prototype.register_death_listener = function(o) {
      return this.death_listeners.push(o);
    };

    Player.prototype.handle_key = function(b, key) {
      if (__indexOf.call(this.directions, key) >= 0) {
        return b.move(this.name, key, this.check_move);
      }
    };

    Player.prototype.check_move = function(state, p1, p2) {
      var target;
      target = state[p2.y][p2.x];
      switch (target) {
        case '#':
          return this.position = p1;
        case '|':
          return this.position = p1;
        case 'g':
          this.gold += 1;
          return this._move(state, p1, p2);
        case 'T':
        case 'G':
          return this.die(p2);
        default:
          return this._move(state, p1, p2);
      }
    };

    Player.prototype._move = function(s, p1, p2) {
      s[p1.y][p1.x] = '.';
      return s[p2.y][p2.x] = '@';
    };

    Player.prototype.die = function(p) {
      var l, _i, _len, _ref, _results;
      _ref = this.death_listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        _results.push(l.game_over(p));
      }
      return _results;
    };

    return Player;

  })(Character);

  main = function() {
    var b, b1, p;
    b1 = build_basement();
    b = new Browser($('#stage'), $('#location'), $('#messages'), $('#gold'), $('#experience'), b1);
    p = b1.characters[b1.player];
    b.register_key_listener(p);
    return p.register_death_listener(b);
  };

  build_basement = function() {
    var b1, crok, griphook, harry;
    b1 = new Basement('B1', {
      width: 80,
      height: 20
    });
    crok = new Troll('Crok', {
      x: 1,
      y: 2
    });
    griphook = new Goblin('Griphook', {
      x: 3,
      y: 4
    });
    harry = new Player('Harry', {
      x: 10,
      y: 10
    });
    b1.generate();
    b1.spawn(crok);
    b1.spawn(griphook);
    b1.set_player(harry);
    b1.down_stairs({
      x: 20,
      y: 18
    });
    return b1;
  };

  first_move = function(b, b1) {
    b1.move('Crok', 'down');
    b1.move('Griphook', 'right');
    return b1.move('Harry', 'up');
  };

  $(document).ready(function() {
    return main();
  });

}).call(this);
