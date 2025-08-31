import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit, Crescendo, Block, Protecting, ProtectedBy } from "../Effect/Effect.mjs";
import { rollDice } from "../DiceRoll.mjs";

export class ManAtArmsPassive extends Ability {
    constructor(owner) {
        super("[Passive] Brothers in Arms", "img:icon_manatarms_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you protect someone, you gain -1 stress.</span>";
    }

    getRanks() {
        return "";
    }
}

export class ManAtArmsAbility1 extends Ability {
    constructor(owner) {
        super("Defender", "img:icon_manatarms_ability1", owner, false, [1,2,3], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>Protect target twice. You gain two " + Block.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var protectorEffects = [new Protecting(this.owner, target), new Protecting(this.owner, target)];
            var protectedEffects = [new ProtectedBy(target, this.owner, protectorEffects[0]), new ProtectedBy(target, this.owner, protectorEffects[1])]
            var tss = [
                new TargetSummary(this.owner, false, true, false, 0, 0, protectorEffects.concat([new Block(this.owner),new Block(this.owner)]), [], 0),
                new TargetSummary(target, false, true, false, 0, 0, protectedEffects, [], 0)];
            this.owner.removeExistingProtections();
            return new CombatSummary(
                this.name, this.owner, tss, 1);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 1);
        }
    }
}

export class H_ManAtArmsAbility1 extends Ability {
    constructor(owner) {
        super("Defender", "img:icon_manatarms_ability1", owner, false, [1,2,3], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>Protect target twice. You gain " + HGain("one " + Block.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var protectorEffects = [new Protecting(this.owner, target), new Protecting(this.owner, target)];
            var protectedEffects = [new ProtectedBy(target, this.owner, protectorEffects[0]), new ProtectedBy(target, this.owner, protectorEffects[1])]
            var tss = [
                new TargetSummary(this.owner, false, true, false, 0, 0, protectorEffects.concat([new Block(this.owner)]), [], 0),
                new TargetSummary(target, false, true, false, 0, 0, protectedEffects, [], 0)];
            this.owner.removeExistingProtections();
            return new CombatSummary(
                this.name, this.owner, tss, 1);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 1);
        }
    }
}

export class ManAtArmsAbility2 extends Ability {
    knockback_chance = 30;
    constructor(owner) {
        super("Crush", "img:icon_manatarms_ability2", owner, true, [1,2], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        var knockOdds = this.owner.getOdds(this.knockback_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + knockOdds + " %]: Target gains " + Stunned.getImage(50) + " and moves 1 backward.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.knockback_chance)) {
            tss[0].movement = 1;
            tss[0].effectsGained.push(new Stunned(target));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class H_ManAtArmsAbility2 extends Ability {
    knockback_chance = 15;
    constructor(owner) {
        super("Crush", "img:icon_manatarms_ability2", owner, true, [1,2], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        var knockOdds = this.owner.getOdds(this.knockback_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + HGain(knockOdds + " %") + "]: Target gains " + Stunned.getImage(50) + " and moves 1 backward.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.knockback_chance)) {
            tss[0].movement = 1;
            tss[0].effectsGained.push(new Stunned(target));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class ManAtArmsAbility3 extends Ability {
    best_chance = 30;
    constructor(owner) {
        super("Bolster", "img:icon_manatarms_ability3", owner, false, [3,4], [], false);
    }

    getDescription() {
        var bestOdds = this.owner.getOdds(this.best_chance);
        var okOdds = (100 - bestOdds) / 2;
        var badOdds = (100 - bestOdds) / 2;
        return "<span>For each player:<br>"
            + "[" + badOdds + "%]: Nothing.<br>"
            + "[" + okOdds + "%]: Target gains -1 stress.<br>"
            + "[" + bestOdds + "%]: Target gains -1 stress and +1 HP.</span>";
    }

    getRanks() {
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | Targets all allies</span><br>";
    }

    cast(targets) {
        var allies = targets[0];
        var tss = [];
        for (var i = 0; i < allies.length; i++) {
            if (this.owner.procs(this.best_chance)) {
                tss.push(new TargetSummary(allies[i], false, true, false, 1, 1, [], [], 0));
            } else if (rollDice(2) == 2) {
                tss.push(new TargetSummary(allies[i], false, true, false, 0, 1, [], [], 0));
            } else {
                tss.push(new TargetSummary(allies[i], false, true, false, 0, 0, [], [], 0));
            }
        }
        return new CombatSummary(
            this.name, this.owner, tss, 3);
    }
}

export class H_ManAtArmsAbility3 extends Ability {
    best_chance = 10;
    constructor(owner) {
        super("Bolster", "img:icon_manatarms_ability3", owner, false, [3,4], [], false);
    }

    getDescription() {
        var bestOdds = this.owner.getOdds(this.best_chance);
        var okOdds = (100 - bestOdds) / 2;
        var badOdds = (100 - bestOdds) / 2;
        return "<span>For each player:<br>"
            + "[" + HGain(badOdds + "%") + "]: Nothing.<br>"
            + "[" + HGain(okOdds + "%") + "]: Target gains -1 stress.<br>"
            + "[" + HGain(bestOdds + "%") + "]: Target gains -1 stress and +1 HP.</span>";
    }

    getRanks() {
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | Targets all allies</span><br>";
    }

    cast(targets) {
        var allies = targets[0];
        var tss = [];
        for (var i = 0; i < allies.length; i++) {
            if (this.owner.procs(this.best_chance)) {
                tss.push(new TargetSummary(allies[i], false, true, false, 1, 1, [], [], 0));
            } else if (rollDice(2) == 2) {
                tss.push(new TargetSummary(allies[i], false, true, false, 0, 1, [], [], 0));
            } else {
                tss.push(new TargetSummary(allies[i], false, true, false, 0, 0, [], [], 0));
            }
        }
        return new CombatSummary(
            this.name, this.owner, tss, 3);
    }
}