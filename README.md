Gringotz
========

[Play online](http://chris-hanson.me/Gringotz/)


About
-----
Gringotz is a roguelike dungeon explorer based in the famous wizarding bank by 
a similar (though, I hope, legally distinct) name. The player is a wizard
seeking treasure and relics. Currently, the game is extremely incomplete.

Play
----

### Sprites
Sprites, for lack of a better term, are ascii characters that represent terrain,
characters (including monsters), and items.

* . - open space
* # - wall
* > - downward stairs
* < - upward stairs
* g - gold
* | - locked door
*   - hole (blank space)

### Keyboard

* Arrow keys move the character around.
* d - down stairs.
* u - up stairs.
* i - cast an incantation.

Vim style keybindings are also available for movment:

* h - left
* j - down
* k - up
* l - right

After typing 'i' you will be prompted for the incantation for the spell you
want to cast. The only incantation currently working is *Alohamora*.
Incantations are not case sensitive.

The player gains experience each time a spell is cast successfully. If a spell
has multiple effects, the player gets experience for each. *Alohamora* will
unlock any door adjacent to the player. The player will gain one experience for
each door opened by the spell.

### Incantations

Incantations are not case sensitive. It will eventually be possible to cast
spells without typing the incantation. This will be an ability that you gain
after attaining a specified experience level. For now, all spells are cast with
incantations.

* Alohamora - unlock doors adjacent to player.

TODO
----

* Monsters
* Spells
* Level generator
* Restrict light
