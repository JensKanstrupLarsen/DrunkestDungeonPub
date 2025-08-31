import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit, Blind, Foresight } from "../Effect.mjs";

export class AntiquarianPassive extends Ability {
    loot_chance = 50;
    constructor(owner) {
        super("[Passive] Treasure Seeker", "img:icon_antiquarian_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>You have " + this.owner.getOdds(50) + " % chance to gain extra loot from battles.</span>";
    }

    getRanks() {
        return "";
    }
}

export class AntiquarianAbility1 extends Ability {
    blind_chance = 50;
    constructor(owner) {
        super("Flashpowder", "img:icon_antiquarian_ability1", owner, true, [2,3,4], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        var blindOdds = this.owner.getOdds(this.blind_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + blindOdds + "]: Target gains " + Blind.getImage(50) + ".<br>"
            + "You gain " + Dodge.getImage(50) + " and -1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var damage = this.owner.strength;
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 1, [new Dodge(this.owner)], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.blind_chance)) {
            tss[0].effectsGained.push(new Blind(target));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_AntiquarianAbility1 extends Ability {
    blind_chance = 50;
    constructor(owner) {
        super("Flashpowder", "img:icon_antiquarian_ability1", owner, true, [2,3,4], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var damage = 0;
        var blindOdds = this.owner.getOdds(this.blind_chance);
        return "<span>Attack - On hit: Deal " + HGain(damage + " damage") + ". Bonus [" + blindOdds + "]: Target gains " + Blind.getImage(50) + ".<br>"
            + "You gain " + Dodge.getImage(50) + " and -1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, 0, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 1, [new Dodge(this.owner)], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.blind_chance)) {
            tss[0].effectsGained.push(new Blind(target));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class AntiquarianAbility2 extends Ability {
    fs_chance = 50;
    constructor(owner) {
        super("Dark Incantation", "img:icon_antiquarian_ability2", owner, false, [4], [1,2,3,4], true);
    }

    getDescription() {
        var fsOdds = this.owner.getOdds(this.fs_chance)
        return "<span>[" + (100-fsOdds) + "%]: You gain 2 stress.<br>"
            + "[" + fsOdds + "%]: Target gains " + Foresight.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = []
        if (this.owner.singleTargetHits()) {
            if (this.owner.procs(this.fs_chance)) {
                tss.push(new TargetSummary(target, false, true, false, 0, 0, [new Foresight(target)], [], 0));
            } else {
                tss.push(new TargetSummary(this.owner, true, true, false, 0, 2, [], [], 0));
            }
        } else {
            tss.push(new TargetSummary(target, false, false, false, 0, 0, [], [], 0))
        }
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class H_AntiquarianAbility2 extends Ability {
    fs_chance = 50;
    constructor(owner) {
        super("Dark Incantation", "img:icon_antiquarian_ability2", owner, false, [4], [1,2,3,4], true);
    }

    getDescription() {
        var fsOdds = this.owner.getOdds(this.fs_chance)
        return "<span>[" + (100-fsOdds) + "%]: You gain 2 stress " + HGain(" and take 2 damage") + ".<br>"
            + "[" + fsOdds + "%]: Target gains " + Foresight.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = []
        if (this.owner.singleTargetHits()) {
            if (this.owner.procs(this.fs_chance)) {
                tss.push(new TargetSummary(target, false, true, false, 0, 0, [new Foresight(target)], [], 0));
            } else {
                tss.push(new TargetSummary(this.owner, true, true, false, 2, 2, [], [], 0));
            }
        } else {
            tss.push(new TargetSummary(target, false, false, false, 0, 0, [], [], 0))
        }
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class AntiquarianAbility3 extends Ability {
    constructor(owner) {
        super("Unnerving Chant", "img:icon_antiquarian_ability3", owner, false, [3,4], [1,2,3,4], true);
    }

    getDescription() {
        var fsOdds = this.owner.getOdds(this.fs_chance)
        return "<span>Target gains " + Crit.getImage(50) + " and 1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = [];
        if (this.owner.singleTargetHits()) {
            tss.push(new TargetSummary(target, true, true, false, 0, 1, [new Crit(target)], [], 0));
        } else {
            tss.push(new TargetSummary(target, false, false, false, 0, 0, [], [], 0))
        }
        return new CombatSummary(this.name, this.owner, tss, 3);
    }
}

export class H_AntiquarianAbility3 extends Ability {
    constructor(owner) {
        super("Unnerving Chant", "img:icon_antiquarian_ability3", owner, false, [3,4], [1,2,3,4], true);
    }

    getDescription() {
        var fsOdds = this.owner.getOdds(this.fs_chance)
        return "<span>Target gains " + Crit.getImage(50) + ", " + HGain(Exposed.getImage(50)) + " and 1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var tss = [];
        if (this.owner.singleTargetHits()) {
            tss.push(new TargetSummary(target, true, true, false, 0, 1, [new Crit(target), new Exposed(target)], [], 0));
        } else {
            tss.push(new TargetSummary(target, false, false, false, 0, 0, [], [], 0))
        }
        return new CombatSummary(this.name, this.owner, tss, 3);
    }
}