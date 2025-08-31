# Welcome... to the Drunkest Dungeon.
Oversigt over mapperne:

- `index.js`: Spilkoordinator der kører på `dengyldneøl.dk:50005/dd`, og
  leverer siderne `dengyldneøl.dk:50005/dd/host` og
  `dengyldneøl.dk:50005/dd/player`. Laver ikke meget andet ud over at holde
  styr på sessions/rooms og sende kommunikation mellem spillere og hosts.

- `public_html/dd/modules` indeholder det meste af selve spillets kode:
    - `Game/` indeholder `ClientGame.mjs`, som er den spil-logik der kører på
      spiller-siden, og ligeledes indeholder `HostGame.mjs` det der kører på
      host-siden. `ClientGame.mjs` er primært bare print af spiller-siden,
      hvorimod `HostGame.mjs` er den faktiske spil-logik som bevægelse,
      combat, osv.
    - `Class/` indeholder logikken for karakterer generelt (spillere såvel som
      fjender) i `Class/Character.mjs`, mere specifik logik for hver enkelt
      spiller-class i `Class/Hero.mjs` og fjender i `Class/Enemy.mjs`.
    - `Ability/` indeholder abilities for hver enkelt class, og desuden
      abilities for fjender i `Ability/EnemyAbility.mjs`.
    - `Item/Item.mjs` indeholder logik for alle items.
    - `Effect/Effect.mjs` indeholder logik for alle buffs/debuffs.
    - `Curio/Curio.mjs` indeholder logik for alle curios (ting man kan støde
      på i corridors)