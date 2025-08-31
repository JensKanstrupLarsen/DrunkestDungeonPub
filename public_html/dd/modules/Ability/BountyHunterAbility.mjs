import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit, Rage, Blind } from "../Effect/Effect.mjs";

export class BountyHunterPassive extends Ability {
    constructor(owner) {
        super("[Passive] Brawler", "img:icon_bountyhunter_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you take damage, gain  " + Dodge.getImage(50) + ".</span>";
    }

    getRanks() {
        return "";
    }
}

export class BountyHunterAbility1 extends Ability {
    constructor(owner) {
        super("Come Hither", "img:icon_bountyhunter_ability1", owner, true, [1,2,3], [-2,-3,-4], false);
    }

    getDescription() {
        return "<span>Target gains " + Exposed.getImage(50) + " and moves 2 forward.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = []
        if (this.owner.singleTargetHits()) {
            tss.push(new TargetSummary(target, true, true, false, 0, 0, [new Exposed(target)], [], -2));
        }  else {
            tss.push(new TargetSummary(target, true, false, false, 0, 0, [], [], 0))
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_BountyHunterAbility1 extends Ability {
    constructor(owner) {
        super("Come Hither", "img:icon_bountyhunter_ability1", owner, true, [1], [-2,-3,-4], false);
    }

    getDescription() {
        return "<span>Target gains " + Exposed.getImage(50) + " and moves 2 forward.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = []
        if (this.owner.singleTargetHits()) {
            tss.push(new TargetSummary(target, true, true, false, 0, 0, [new Exposed(target)], [], -2));
        }  else {
            tss.push(new TargetSummary(target, true, false, false, 0, 0, [], [], 0))
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }

    getRanks() {
        var targets = "Target enemy: " + this.targetRanks.map((t) => Math.abs(t));
        return "<span style='font-size:40px'>" + HGain("Pos: " + this.usableRanks.toString()) + " | " + targets + "</span><br>";
    }
}

export class BountyHunterAbility2 extends Ability {
    constructor(owner) {
        super("Collect Bounty", "img:icon_bountyhunter_ability2", owner, true, [1,2], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        return "<span>Attack - On hit: Deal " + damage + " damage, plus 1 for each " + Exposed.getImage(50) + " on target.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var damage = this.owner.strength+1;
        for (var i = 0; i < target.effects.length; i++) {
            var effect = target.effects[i];
            if (effect.name == "exposed") {
                damage += 1;
            }
        }
        var attack = this.owner.rollToAttack(0, damage);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 2);
    }
}

export class H_BountyHunterAbility2 extends Ability {
    constructor(owner) {
        super("Collect Bounty", "img:icon_bountyhunter_ability2", owner, true, [1,2], [-1], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        return "<span>Attack - On hit: Deal " + damage + " damage, plus 1 for each " + Exposed.getImage(50) + " on target.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var damage = this.owner.strength+1;
        for (var i = 0; i < target.effects.length; i++) {
            var effect = target.effects[i];
            if (effect.name == "exposed") {
                damage += 1;
            }
        }
        var attack = this.owner.rollToAttack(0, damage);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 2);
    }

    getRanks() {
        var targets = "Target enemy: " + this.targetRanks.map((t) => Math.abs(t));
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | " + HGain(targets) + "</span><br>";
    }
}

export class BountyHunterAbility3 extends Ability {
    constructor(owner) {
        super("Flashbang", "img:icon_bountyhunter_ability3", owner, true, [1,2,3], [-1,-2,-3], false);
    }

    getDescription() {
        return "<span>Target gains " + Blind.getImage(50) + " and " + Exposed.getImage(50) + ". Clear all corpses.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = [];
        for (var i = 0; i < this.owner.game.enemies.length; i++) {
            var enemy = this.owner.game.enemies[i];
            if (enemy.isDead()) {
                tss.push(new TargetSummary(enemy, true, true, false, 1, 0, [], [], 0));
            }
        }
        if (this.owner.singleTargetHits()) {
            tss.push(new TargetSummary(target, true, true, false, 0, 0, [new Blind(target), new Exposed(target)], [], 0));
        }  else {
            tss.push(new TargetSummary(target, true, false, false, 0, 0, [], [], 0));
        }
        return new CombatSummary(this.name, this.owner, tss, 3);
    }
}

export class H_BountyHunterAbility3 extends Ability {
    constructor(owner) {
        super("Flashbang", "img:icon_bountyhunter_ability3", owner, true, [1,2,3], [-1,-2,-3], false);
    }

    getDescription() {
        return "<span>Target gains " + Blind.getImage(50) + HLose(" and " + Exposed.getImage(50)) + ". Clear all corpses.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = [];
        for (var i = 0; i < this.owner.game.enemies.length; i++) {
            var enemy = this.owner.game.enemies[i];
            if (enemy.isDead()) {
                tss.push(new TargetSummary(enemy, true, true, false, 1, 0, [], [], 0));
            }
        }
        if (this.owner.singleTargetHits()) {
            tss.push(new TargetSummary(target, true, true, false, 0, 0, [new Blind(target), new Exposed(target)], [], 0));
        }  else {
            tss.push(new TargetSummary(target, true, false, false, 0, 0, [], [], 0));
        }
        return new CombatSummary(this.name, this.owner, tss, 3);
    }
}