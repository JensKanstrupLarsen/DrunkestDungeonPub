import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit, Crescendo } from "../Effect/Effect.mjs";

export class JesterPassive extends Ability {
    constructor(owner) {
        super("[Passive] Vicious Mockery", "img:icon_jester_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you take damage, the attacker gains  " + Exposed.getImage(50) + ".</span>";
    }

    getRanks() {
        return "";
    }
}

export class JesterAbility1 extends Ability {
    crit_chance = 50;
    constructor(owner) {
        super("Inspiring Tune", "img:icon_jester_ability1", owner, false, [2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        var critOdds = this.owner.getOdds(this.crit_chance)
        return "<span>You move 1 backward and gain " + Crescendo.getImage(50) +".<br>"
            + "[" + (100-critOdds) + "%]: Target gains -2 stress.<br>"
            + "[" + critOdds + "%]: Target gains -2 stress and " + Crit.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [
                new TargetSummary(target, false, true, false, 0, 2, [], [], 0),
                new TargetSummary(this.owner, false, true, false, 0, 0, [new Crescendo(this.owner, 1)], [], 1)];
            if (this.owner.procs(this.crit_chance)) {
                tss[0].effectsGained.push(new Crit(target));
            }
            return new CombatSummary(
                this.name, this.owner, tss, 1);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [new Crescendo(this.owner, 1)], [], 1)], 1);
        }
    }
}

export class H_JesterAbility1 extends Ability {
    crit_chance = 50;
    constructor(owner) {
        super("Inspiring Tune", "img:icon_jester_ability1", owner, false, [2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        var critOdds = this.owner.getOdds(this.crit_chance)
        return "<span>You " + HLose("move 1 backward and") + " gain " + Crescendo.getImage(50) +".<br>"
            + "[" + (100-critOdds) + "%]: Target gains -1 stress.<br>"
            + "[" + critOdds + "%]: Target gains -1 stress and " + Crit.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [
                new TargetSummary(target, false, true, false, 0, 1, [], [], 0),
                new TargetSummary(this.owner, false, true, false, 0, 0, [new Crescendo(this.owner, 1)], [], 0)];
            if (this.owner.procs(this.crit_chance)) {
                tss[0].effectsGained.push(new Crit(target));
            }
            return new CombatSummary(
                this.name, this.owner, tss, 1);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [new Crescendo(this.owner, 1)], [], 0)], 1);
        }
    }
}

export class JesterAbility2 extends Ability {
    constructor(owner) {
        super("Slice Off", "img:icon_jester_ability2", owner, true, [2,3,4], [-1,-2,-3], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        return "<span>You move 1 ahead and gain " + Crescendo.getImage(50) + ".<br>Attack - On hit: Deal " + damage + " damage.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Crescendo(this.owner, 1)], [], -1)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class H_JesterAbility2 extends Ability {
    constructor(owner) {
        super("Slice Off", "img:icon_jester_ability2", owner, true, [2,3,4], [-1,-2,-3], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        return "<span>You " + HLose("move 1 ahead and") + " gain " + Crescendo.getImage(50) + ".<br>Attack - On hit: Deal " + damage + " damage.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Crescendo(this.owner, 1)], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class JesterAbility3 extends Ability {
    constructor(owner) {
        super("Finale", "img:icon_jester_ability3", owner, true, [1], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var damage = 0;
        console.log(this.owner.effects);
        for (var i = 0; i < this.owner.effects.length; i++) {
            var effect = this.owner.effects[i];
            console.log(effect.name);
            if (effect.name == "crescendo") {
                damage += 1;
            }
        }
        damage = damage*2;
        return "<span>Deal " + Crescendo.getImage(50) + "x2 damage to target. You gain 1 stress and move 3 backward.<br>"
            + "Lose all " + Crescendo.getImage(50) + ". Usable once per combat.</span>";
    }

    cast(targets) {
        this.usableRanks = [];
        var target = targets[0];
        var damage = 0;
        for (var i = 0; i < this.owner.effects.length; i++) {
            var effect = this.owner.effects[i];
            if (effect.name == "crescendo") {
                effect.proc = true;
                damage += 1;
            }
        }
        damage = damage*2;
        if (this.owner.singleTargetHits()) {
            var isCrit = false;
            var scProc = this.owner.procSuperCrit();
            if (scProc.procs) {
                isCrit = true;
                damage += damage*scProc.bonus;
            } else {
                var cProc = this.owner.procCrit();
                if (cProc.procs) {
                    isCrit = true;
                    damage += damage*cProc.bonus;
                }
            }
            var tss = [
                new TargetSummary(target, true, true, isCrit, damage, 0, [], [], 0),
                new TargetSummary(this.owner, false, true, isCrit, 0, 1, [], [], 3)];
            return new CombatSummary(
                this.name, this.owner, tss, 3);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, true, false, false, 0, 0, [], [], 3)], 3);
        }
    }
}

export class H_JesterAbility3 extends Ability {
    constructor(owner) {
        super("Finale", "img:icon_jester_ability3", owner, true, [1], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var damage = 0;
        for (var i = 0; i < this.owner.effects.length; i++) {
            var effect = this.owner.effects[i];
            if (effect.name == "crescendo") {
                damage += 1;
            }
        }
        damage = damage*2;
        return "<span>Deal " + Crescendo.getImage(50) + "x2 damage to target. You gain " + HGain("maximum stress") + " and move 3 backward.<br>"
            + "Lose all " + Crescendo.getImage(50) + ". Usable once per combat.</span>";
    }

    cast(targets) {
        this.usableRanks = [];
        var target = targets[0];
        var damage = 0;
        for (var i = 0; i < this.owner.effects.length; i++) {
            var effect = this.owner.effects[i];
            if (effect.name == "crescendo") {
                effect.proc = true;
                damage += 1;
            }
        }
        damage = damage*2;
        if (this.owner.singleTargetHits()) {
            var isCrit = false;
            var scProc = this.owner.procSuperCrit();
            if (scProc.procs) {
                isCrit = true;
                damage += damage*scProc.bonus;
            } else {
                var cProc = this.owner.procCrit();
                if (cProc.procs) {
                    isCrit = true;
                    damage += damage*cProc.bonus;
                }
            }
            var tss = [
                new TargetSummary(target, true, true, isCrit, damage, 0, [], [], 0),
                new TargetSummary(this.owner, false, true, isCrit, 0, this.owner.maxStress, [], [], 3)];
            return new CombatSummary(
                this.name, this.owner, tss, 3);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, true, false, false, 0, 0, [], [], 3)], 3);
        }
    }
}