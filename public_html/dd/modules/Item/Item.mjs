import { CombatSummary, createDummyTS, TargetSummary } from "../Ability/Ability.mjs";
import { getRandomInt, rollDice } from "../DiceRoll.mjs";
import { Foresight } from "../Effect/Effect.mjs";

export class Item {
    name = "";
    text = "";
    imageSrc = "";
    game = undefined;
    usableInCombat = false;
    constructor(name, text, imageSrc, game) {
        this.name = name;
        this.text = text;
        this.imageSrc = imageSrc;
        this.game = game;
    }
    use(target) {
        return new TargetSummary(target, false, false, false, 0, 0, [], [], 0);
    }
    getTitle() {
        return "<span style='font-size:100px'>" + this.name + "</span><br>";
    }
    getDescription() {
        return "<p>" + this.text + "</p>";
    }
    getHTML() {
        return this.getTitle() + this.getDescription();
    }
    actHost(allies, enemies) {
        var validTargets = [];
        for (var i = 0; i < allies.length; i++) {
            var target = allies[i];
            validTargets.push(target);
        }
        this.singleTarget(validTargets.reverse(), (target) => {
            this.game.sendItemUse(this.use([target]), false);})
    }
    actPlayer(allies, enemies) {
        var validTargets = [];
        for (var i = 0; i < allies.length; i++) {
            var target = allies[i];
            validTargets.push({rank : i+1, target : target});
        }
        this.singleTargetPlayer(validTargets.reverse(), (target) => {
            this.game.sendItemUse(this.name, target);});
    }
    singleTargetPlayer(targets, callback) {
        var imgs = []; var hps = []; var maxHps = []; var callbacks = [];
        for (var i = 0; i < targets.length; i++) {
            imgs.push(targets[i].target.img);
            hps.push(targets[i].target.hp.current);
            maxHps.push(targets[i].target.hp.max);
            callbacks.push(((target) => () => callback(target))(targets[i].rank));
        }
        this.game.getTargetPopup(imgs, hps, maxHps, callbacks);
    }
    singleTarget(targets, callback) {
        var imgs = []; var hps = []; var maxHps = []; var callbacks = [];
        for (var i = 0; i < targets.length; i++) {
            imgs.push(targets[i].getAnimIdle());
            hps.push(targets[i].hp);
            maxHps.push(targets[i].maxHp);
            callbacks.push(((target) => () => callback(target))(targets[i]));
        }
        this.game.getTargetPopup(imgs, hps, maxHps, callbacks);
    }
}

export function getRandomItem(game) {
    var proc = rollDice(100);
    if (proc <= 20) {
        return new Torch(game);
    } else if (proc <= 40) {
        return new MedicinalHerbs(game);
    } else if (proc <= 70) {
        return new HealingVial(game);
    } else {
        return new HolyWater(game);
    }
}

export class HealingVial extends Item {
    constructor(game) {
        super("Healing vial", "Target player gains 2 HP.", "images/items/healing_vial.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        return new CombatSummary(this.name, owner, [new TargetSummary(target, false, true, false, 2, 0, [], [], 0)], 0);
    }
}

export class HolyWater extends Item {
    constructor(game) {
        super("Holy water", "Target player gains -2 stress.", "images/items/holy_water.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        return new CombatSummary(this.name, owner, [new TargetSummary(target, false, true, false, 0, 2, [], [], 0)], 0);
    }
}

export class MedicinalHerbs extends Item {
    constructor(game) {
        super("Medicinal herbs", "Target player loses all debuffs.", "images/items/medicinal_herbs.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        var purgedDebuffs = [];
        for (var i = 0; i < target.effects.length; i++) {
            var effect = target.effects[i];
            if (effect.isDebuff) {
                purgedDebuffs.push(effect.name);
            }
        }
        return new CombatSummary(this.name, owner, [new TargetSummary(target, false, true, false, 0, 0, [], purgedDebuffs, 0)], 0);
    }
}

export class Torch extends Item {
    constructor(game) {
        super("Torch", "Reveal adjacent corridors and rooms.", "images/items/torch.png", game);
    }
    use(owner, target) {
        var adjacent = this.game.getAdjacentRooms(this.game.partyLocation);
        this.game.revealDungeon(adjacent.rooms,adjacent.corridors);
        var ts = new TargetSummary(owner, false, false, true, 0, 0, [], [], 0);
        ts.texts["Revealed surroundings!"];
        return new CombatSummary(this.name, owner, [ts], 0);
    }
    actPlayer(allies, enemies) {
        this.game.sendItemUse(this.name, 0);
    }
}

export function getItemFromName(name, game) {
    switch(name) {
        case "Healing vial":
            return new HealingVial(game);
        case "Holy water":
            return new HolyWater(game);
        case "Medicinal herbs":
            return new MedicinalHerbs(game);
        case "Torch":
            return new Torch(game);
        case "Eldritch Vial":
            return new EldritchVial(game);
        case "Eldritch Candle":
            return new EldritchCandle(game);
        case "Eldritch Map":
            return new EldritchMap(game);
        case "Eldritch Pen":
            return new EldritchPen(game);
        case "Eldritch Statue":
            return new EldritchStatue(game);
    }
}

export class EldritchVial extends Item {
    constructor(game) {
        super("Eldritch Vial", "Target player gains 3 HP and -3 stress.", "images/items/eldritch_vial.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        return new CombatSummary(this.name, owner, [new TargetSummary(target, false, true, false, 3, 3, [], [], 0)], 0);
    }
}

export class EldritchCandle extends Item {
    constructor(game) {
        super("Eldritch Candle", "All players lose their Hopeless status.<br>Has no effect if already at max stress.", "images/items/eldritch_candle.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        var tss = [];
        for (var i = 0; i < this.game.players.length; i++) {
            var target = this.game.players[i];
            if (target.isHopeless && target.stress < target.maxStress) {
                var ts = createDummyTS(target);
                ts.texts = ["Regained hope!"];
                target.isHopeless = false;
                tss.push(ts);
            }
        }
        return new CombatSummary(this.name, owner, ts, 0);
    }
    actPlayer(allies, enemies) {
        this.game.sendItemUse(this.name, 0);
    }
}

export class EldritchMap extends Item {
    constructor(game) {
        super("Eldritch Map", "Reveals a random key.<br>If all keys are revealed, reveal a secret room instead.", "images/items/eldritch_map.png", game);
    }
    use(owner, target) {
        var text = "";
        var ts = createDummyTS(owner);
        var keyRoom = [];
        for (var y = 0; y < this.game.dungeonLayout.length; y++) {
            for (var x = 0; x < this.game.dungeonLayout[y].length; x++) {
                var roomType = this.game.dungeonLayout[y][x];
                if (roomType == 4 && !this.game.dungeonFOW[y][x]) {
                    keyRoom.push(y*4+x);
                }
            }
        }
        if (keyRoom.length > 1) {
            this.game.revealDungeon([keyRoom[getRandomInt(keyRoom.length)]], []);
            text = "Key revealed!";
        } else {
            var secretRoom = getRandomInt(24);
            var coords = this.game.getCorridorXY(secretRoom);
            this.game.corridorLayout[coords.y][coords.x] = 4;
            this.game.revealDungeon([], [secretRoom])
            text = "Room revealed!";
        }
        return new CombatSummary(text, owner, [ts], false);
    }
    actPlayer(allies, enemies) {
        this.game.sendItemUse(this.name, 0);
    }
}

export class EldritchPen extends Item {
    constructor(game) {
        super("Eldritch Pen", "Target player gains " + Foresight.getImage(20) + ".", "images/items/eldritch_pen.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        return new CombatSummary(this.name, owner, [new TargetSummary(target, false, true, false, 0, 0, [new Foresight(target)], [], 0)], 0);
    }
}

export class EldritchStatue extends Item {
    constructor(game) {
        super("Eldritch Statue", "Target player permanently gains +1 max HP, max Stress and strength.", "images/items/eldritch_statue.png", game);
        this.usableInCombat = true;
    }
    use(owner, target) {
        var ts = new TargetSummary(target, false, true, false, 0, 0, [], [], 0);
        player.maxHp += 1;
        player.hp += 1;
        player.maxStress += 1;
        player.strength += 1;
        var text = "Power surges!";
        return new CombatSummary(text, player, [ts], 0);
    }
}

export function getRandomEldritchItem(game) {
    var proc = rollDice(4);
    switch (proc) {
        case 1:
            return new EldritchVial(game);
        case 2:
            return new EldritchCandle(game);
        case 3:
            return new EldritchMap(game);
        case 4:
            return new EldritchPen(game);
    }
}