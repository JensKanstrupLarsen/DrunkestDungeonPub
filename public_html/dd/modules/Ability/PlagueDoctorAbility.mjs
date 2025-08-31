import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge } from "../Effect.mjs";

export class PlagueDoctorPassive extends Ability {
    constructor(owner) {
        super("[Passive] Surgical Precision", "img:icon_plaguedoctor_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you gain HP, gain 1 extra.</span>";
    }

    getRanks() {
        return "";
    }
}

export class PlagueDoctorAbility1 extends Ability {
    exp_chance = 50;
    constructor(owner) {
        super("Plague Grenade", "img:icon_plaguedoctor_ability1", owner, true, [3,4], [-2,-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        var expOdds = this.owner.getOdds(this.exp_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + expOdds + "%]: Target gains " + Exposed.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.exp_chance)) {
            tss[0].effectsGained.push(new Exposed(target, 1));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_PlagueDoctorAbility1 extends Ability {
    exp_chance = 25;
    constructor(owner) {
        super("Plague Grenade", "img:icon_plaguedoctor_ability1", owner, true, [3,4], [-2,-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        var expOdds = this.owner.getOdds(this.exp_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + HGain(expOdds + " %") + "]: Target gains " + Exposed.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.exp_chance)) {
            tss[0].effectsGained.push(new Exposed(target, 1));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class PlagueDoctorAbility2 extends Ability {
    constructor(owner) {
        super("Battlefield Medicine", "img:icon_plaguedoctor_ability2", owner, false, [2,3,4], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>You and target gain +1 HP.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [
                new TargetSummary(target, false, true, false, 1, 0, [], [], 0),
                new TargetSummary(this.owner, false, true, false, 1, 0, [], [], 0)];
            tss = tss.concat(this.owner.onHealing(tss[0]));
            tss = tss.concat(this.owner.onHealing(tss[1]));
            return new CombatSummary(
                this.name, this.owner, tss, 2);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 2);
        }
    }
}

export class H_PlagueDoctorAbility2 extends Ability {
    constructor(owner) {
        super("Battlefield Medicine", "img:icon_plaguedoctor_ability2", owner, false, [2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        return "<span>" + HLose("You and") + " target gains +1 HP.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [new TargetSummary(target, false, true, false, 1, 0, [], [], 0)];
            tss = tss.concat(this.owner.onHealing(tss[0]));
            return new CombatSummary(
                this.name, this.owner, tss, 2);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 2);
        }
    }
}

export class PlagueDoctorAbility3 extends Ability {
    constructor(owner) {
        super("Antidote", "img:icon_plaguedoctor_ability3", owner, false, [2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        return "<span>Target loses all debuffs and gains " + Dodge.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var debuffs = target.getAllDebuffs();
            var buffs = [new Dodge(target)];
            var tss = [new TargetSummary(target, false, true, false, 0, 0, buffs, debuffs, 0)];
            tss = tss.concat(target.onGiveBuffs());
            return new CombatSummary(
                this.name, this.owner, tss, 3);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 3);
        }
    }
}

export class H_PlagueDoctorAbility3 extends Ability {
    constructor(owner) {
        super("Antidote", "img:icon_plaguedoctor_ability3", owner, false, [2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        return "<span>Target loses all debuffs " + HLose("and gains " + Dodge.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var debuffs = target.getAllDebuffs();
            var tss = [new TargetSummary(target, false, true, false, 0, 0, [], debuffs, 0)];
            return new CombatSummary(
                this.name, this.owner, tss, 3);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 3);
        }
    }
}