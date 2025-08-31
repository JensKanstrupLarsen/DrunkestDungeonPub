import { Ability, CombatSummary, TargetSummary, HGain, HLose } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit, SuperDodge } from "../Effect.mjs";


// From the Shadows
// You take your turn before enemies. At the start of combat, gain [crit].
export class GraveRobberPassive extends Ability {
    constructor(owner) {
        super("[Passive] From The Shadows", "img:icon_graverobber_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>You act before enemies. At the start of combat, gain " + Crit.getImage(50) + ".</span>";
        //return "<span>Whenever you gain " + Dodge.getImage(50) + ", gain " + SuperDodge.getImage(50) + " instead.</span>";
    }

    getRanks() {
        return "";
    }
}

export class GraveRobberAbility1 extends Ability {
    constructor(owner) {
        super("Lunge", "img:icon_graverobber_ability1", owner, true, [3,4], [-1,-2,-3], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        return "<span>Attack - On hit: Deal " + damage + " damage.<br>You move 2 forward.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [], [], -2)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_GraveRobberAbility1 extends Ability {
    constructor(owner) {
        super("Lunge", "img:icon_graverobber_ability1", owner, true, [3,4], [-1,-2,-3], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        return "<span>Attack - On hit: Deal " + damage + " damage.<br>You move 2 forward " + HGain("and gain " + Exposed.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Exposed(this.owner)], [], -2)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class GraveRobberAbility2 extends Ability {
    constructor(owner) {
        super("Shadowstep", "img:icon_graverobber_ability2", owner, false, [1,2], [], false);
    }

    getDescription() {
        return "<span>Move 2 backward. You gain " + SuperDodge.getImage(50) + " and " + Crit.getImage(50) + ".</span>";
    }

    cast(targets) {
        var tss = [new TargetSummary(this.owner, false, true, false, 0, 0, [new SuperDodge(this.owner), new Crit(this.owner)], [], 2)];
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class H_GraveRobberAbility2 extends Ability {
    constructor(owner) {
        super("Shadowstep", "img:icon_graverobber_ability2", owner, false, [1,2], [], false);
    }

    getDescription() {
        return "<span>Move 2 backward. You gain " + HGain(Dodge.getImage(50)) + " and " + Crit.getImage(50) + ".</span>";
    }

    cast(targets) {
        var tss = [new TargetSummary(this.owner, false, true, false, 0, 0, [new Dodge(this.owner), new Crit(this.owner)], [], 2)];
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class GraveRobberAbility3 extends Ability {
    exp_chance = 30;
    constructor(owner) {
        super("Poison Darts", "img:icon_graverobber_ability3", owner, true, [3,4], [-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        var expOdds = this.owner.getOdds(this.exp_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + expOdds + "%]: Target gains two " + Exposed.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.exp_chance)) {
            tss[0].effectsGained.push(new Exposed(target));
            tss[0].effectsGained.push(new Exposed(target));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 3);
    }
}

export class H_GraveRobberAbility3 extends Ability {
    exp_chance = 30;
    constructor(owner) {
        super("Poison Darts", "img:icon_graverobber_ability3", owner, true, [3,4], [-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        var expOdds = this.owner.getOdds(this.exp_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + expOdds + "%]: Target gains " + HGain("one " + Exposed.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.exp_chance)) {
            tss[0].effectsGained.push(new Exposed(target));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 3);
    }
}