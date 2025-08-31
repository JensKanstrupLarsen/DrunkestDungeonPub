import { CombatSummary, createDummyTS, TargetSummary } from "../Ability/Ability.mjs";
import { getRandomInt, rollDice } from "../DiceRoll.mjs";
import { getRandomItem, getRandomEldritchItem } from "../Item/Item.mjs";

export class Curio {
    game = undefined;
    name = "";
    image = "";
    desc = "";
    constructor(game, name, image, desc) {
        this.game = game;
        this.name = name;
        this.image = image;
        this.desc = desc;
    }
    inspect(player) {
        return new CombatSummary("", player, [], 0);
    }
}

export class Crate extends Curio {
    constructor(game) {
        super(game, "Supply crate", "images/curios/crate.png", "On inspect:<br>[75%]: Nothing.<br>[25%]: Random consumable.")
    }
    inspect(player) {
        var text = "";
        var ts = createDummyTS(player);
        if (player.procs(25)) {
            var inItem = getRandomEldritchItem(this.game);
            this.game.inventory.push(inItem);
            text = "Found supplies!";
        } else {
            text = "The crate is empty.";
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class Fountain extends Curio {
    constructor(game) {
        super(game, "Stone fountain", "images/curios/fountain.png", "On inspect:<br>[60%]: Take 2 sips.<br>[40%]: Random consumable.");
    }
    inspect(player) {
        var text = "";
        var ts = createDummyTS(player);
        if (player.procs(40)) {
            var inItem = getRandomItem(this.game);
            this.game.inventory.push(inItem);
            text = "Offerings!";
        } else {
			player.sips += 2;
            text = "Nothing but water.";
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class Bookshelf extends Curio {
    constructor(game) {
        super(game, "Old bookshelf", "images/curios/bookshelf.png", "On inspect:<br>[50%]: Gain 1 stress.<br>[50%]: Lose 1 stress.");
    }
    inspect(player) {
        var text = "";
        var ts = new TargetSummary(player, false, true, false, 0, 1, [], [], 0);
        if (player.procs(50)) {
            text = "Insight gained!";
        } else {
            ts.isAttack = true;
            text = "Unnerving writings...";
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class AlchemyTable extends Curio {
    constructor(game) {
        super(game, "Alchemy table", "images/curios/alchemy_table.png", "On inspect:<br>[50%]: Lose 1 HP.<br>[50%]: Gain 1 HP.");
    }
    inspect(player) {
        var text = "";
        var ts = new TargetSummary(player, false, true, false, 1, 0, [], [], 0);
        if (player.procs(50)) {
            text = "Successful brew!"
        } else {
            ts.isAttack = true;
            text = "An accident occurs!"
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class WanderingTrader extends Curio {
    outItem = -1;
    inItem = undefined;
    constructor(game) {
        super(game, "Wandering Trader", "images/curios/wandering_trader.png", "");
		this.inItem = getRandomItem(this.game);
        while (this.inItem.name == this.game.inventory[this.outItem].name) {
        	this.inItem = getRandomItem(this.game);
        }
		if (this.game.inventory.length > 0) {
			this.outItem = getRandomInt(this.game.inventory.length);
            this.desc = "On inspect:<br>Trade a " + this.game.inventory[this.outItem].name + " for a " + this.inItem.name + ".";
		} else {
			this.desc = "On inspect:<br>Receive a " + this.inItem.name + "... for free?";
		}
    }
    inspect(player) {
        var text = "";
        var ts = createDummyTS(player);
		if (this.outItem == -1) {
            this.game.inventory.splice(this.outItem, 1);
            this.game.inventory.push(this.inItem);
            text = "Made a trade.";
            return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
		} else {
            this.game.inventory.push(this.inItem);
			text = "Received a gift."
			return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
		}
    }
}

export class Scrolls extends Curio {
    constructor(game) {
        super(game, "Pile of scrolls", "images/curios/scrolls.png", "On inspect:<br>[50%]: Gain 2 stress.<br>[50%]: Reveal a secret room.");
    }
    inspect(player) {
        var text = "";
        var ts = createDummyTS(player);
        if (player.procs(50)) {
            var corridors = this.game.corridorLayout;
            var fow = this.game.corridorFOW;
            var secretRooms = [];
            for (var y = 0; y < corridors.length; y++) {
                for (var x = 0; x < corridors[y].length; x++) {
                    if (corridors[y][x] == 4 && !fow[y][x]) {
                        secretRooms.push({x : x, y : y})
                    }
                }
            }
            if (secretRooms.length > 0) {
                var revealed = secretRooms[getRandomInt(secretRooms.length)];
                this.game.corridorFOW[revealed.y][revealed.x] = true;
                text = "Room revealed!";
            } else {
                text = "All has been found.";
            }
        } else {
            ts.isAttack = true;
            text = "Accursed texts!";
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class EldritchTrader extends Curio {
    constructor(game) {
        super(game, "Eldritch Trader", "images/curios/eldritch_trader.png", "On inspect:<br>Take 6 sips and gain 2 stress for a random eldritch consumable.");
    }
    inspect(player) {
        var ts = new TargetSummary(player, true, true, false, 0, 2, [], [], 0);
        var inItem = getRandomEldritchItem(this.game);
        this.game.inventory.push(inItem);
		player.sips += 6;
        var text = "Sanity for gold.";
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class StoneChest extends Curio {
    constructor(game) {
        super(game, "Strongbox", "images/curios/stone_chest.png", "On inspect:<br>[50%]: Two random consumables.<br>[50%]: Random eldritch consumable.");
    }
    inspect(player) {
        var text = "";
        var ts = createDummyTS(player);
        if (player.procs(50)) {
            this.game.inventory.push(getRandomEldritchItem(this.game));
            text = "A rare find!";
        } else {
            this.game.inventory.push(getRandomItem(this.game));
            this.game.inventory.push(getRandomItem(this.game));
            text = "Supplies stashed here.";
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class HolyFountain extends Curio {
    constructor(game) {
        super(game, "Ornate fountain", "images/curios/holy_fountain.png", "On inspect:<br>Take 3 sips to gain full health.");
    }
    inspect(player) {
        var ts = new TargetSummary(player, false, true, false, player.maxHp, 0, [], [], 0);
        var text = "Invigorating!";
		player.sips += 3;
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class AgedBarrel extends Curio {
    constructor(game) {
        super(game, "Aged barrel", "images/curios/aged_barrel.png", "On inspect:<br>Take 3 sips to lose all stress.");
    }
    inspect(player) {
        var ts = new TargetSummary(player, false, true, false, 0, player.maxStress, [], [], 0);
        var text = "Refreshing!";
		player.sips += 3;
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class ShamblerAltar extends Curio {
    constructor(game) {
        super(game, "Shambler's altar", "images/curios/shambler_altar.png", "On inspect:<br>Discard a torch to fight The Shambler.");
    }
    inspect(player) {
        var text = "";
        var ts = createDummyTS(player);
        var torch = -1;
        for (var i = 0; i < this.game.inventory.length; i++) {
            var item = this.game.inventory[i];
            if (item.name == "Torch") {
                torch = i;
            }
        }
        if (torch != -1) {
            ts.isAttack = true;
            text = "A terrifying figure emerges!";
        } else {
            text = "No light to give.";
        }
        return new CombatSummary(text, player, [ts], ts.isAttack ? -1 : 0);
    }
}

export class EldritchAltar extends Curio {
    constructor(game) {
        super(game, "Eldritch Altar", "images/curios/eldritch_altar.png", "On inspect:<br>Gain +1 max HP, stress and strength.<br>A player cannot use the altar twice.");
    }
    inspect(player) {
        var ts = new TargetSummary(player, false, true, false, 0, 0, [], [], 0);
        player.maxHp += 1;
        player.hp += 1;
        player.maxStress += 1;
        player.strength += 1;
        player.level += 1;
        var text = "Power surges!";
        return new CombatSummary(text, player, [ts], 0);
    }
}