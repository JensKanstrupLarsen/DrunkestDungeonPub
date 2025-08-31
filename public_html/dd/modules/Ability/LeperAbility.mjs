import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Blind, SuperCrit, Crit, Stunned, Protecting, ProtectedBy, SuperBlock } from "../Effect.mjs";

export class LeperPassive extends Ability {
    constructor(owner) {
        super("[Passive] Unbreakable", "img:icon_leper_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you drop to 0 HP, gain " + SuperBlock.getImage(50) + ".</span>";
    }

    getRanks() {
        return "";
    }
}

export class LeperAbility1 extends Ability {
    knockback_chance = 30;
    constructor(owner) {
        super("Hew", "img:icon_leper_ability1", owner, true, [1,2], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        var knockOdds = this.owner.getOdds(this.knockback_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + knockOdds + "%]: Target moves 1 backward and takes 1 extra damage.<br>You gain " + Blind.getImage(50) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Blind(this.owner)], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.knockback_chance)) {
            tss[0].hp += 1;
            tss[0].movement = 1;
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_LeperAbility1 extends Ability {
    knockback_chance = 30;
    constructor(owner) {
        super("Hew", "img:icon_leper_ability1", owner, true, [1,2], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        var knockOdds = this.owner.getOdds(this.knockback_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + knockOdds + "%]: Target moves 1 backward and takes 1 extra damage.<br>You gain " + HGain("two " + Blind.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Blind(this.owner), new Blind(this.owner)], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.knockback_chance)) {
            tss[0].hp += 1;
            tss[0].movement = 1;
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class LeperAbility2 extends Ability {
    constructor(owner) {
        super("Solemnity", "img:icon_leper_ability2", owner, false, [1,2,3,4], [], false);
    }

    getDescription() {
        return "<span>Remove all debuffs. If at 0 health, gain " + SuperCrit.getImage(50) + ", otherwise gain " + Crit.getImage(50) + ".</span>";
    }

    cast(targets) {
        var debuffs = this.owner.getAllDebuffs();
        var tss = [new TargetSummary(this.owner, false, true, false, 0, 0, [], debuffs, 0)];
        if (this.owner.hp == 0) {
            tss[0].effectsGained.push(new SuperCrit(this.owner));
        } else {
            tss[0].effectsGained.push(new Crit(this.owner));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class H_LeperAbility2 extends Ability {
    constructor(owner) {
        super("Solemnity", "img:icon_leper_ability2", owner, false, [1,2,3,4], [], false);
    }

    getDescription() {
        return "<span>Remove all debuffs. If at 0 health, gain " + SuperCrit.getImage(50) + ", " + HLose("otherwise gain " + Crit.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var debuffs = this.owner.getAllDebuffs();
        var tss = [new TargetSummary(this.owner, false, true, false, 0, 0, [], debuffs, 0)];
        if (this.owner.hp == 0) {
            tss[0].effectsGained.push(new SuperCrit(this.owner));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class LeperAbility3 extends Ability {
    constructor(owner) {
        super("Withstand","img:icon_leper_ability3", owner, false, [1,2], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>Protect target. You gain -2 stress. If at 0 health, you gain +1 health.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var srcEffect = new Protecting(this.owner, target);
            var hp = this.owner.hp > 0 ? 0 : 1;
            var tss = [
                new TargetSummary(this.owner, false, true, false, hp, 2, [srcEffect], [], 0),
                new TargetSummary(target, false, true, false, 0, 0, [new ProtectedBy(target, this.owner, srcEffect)], [], 0)];
            tss = tss.concat(this.owner.onHealing(tss[0]))
            this.owner.removeExistingProtections();
            return new CombatSummary(
                this.name,
                this.owner, tss, 3);
        } else {
            return new CombatSummary(
                this.name,
                this.owner, [
                    new TargetSummary(target, false, false, false, 0, 0, [], [], 0)
                ], 3);
        }
    }
}

export class H_LeperAbility3 extends Ability {
    constructor(owner) {
        super("Withstand","img:icon_leper_ability3", owner, false, [1,2], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>Protect target. You gain -2 stress " + HGain("and " + Stunned.getImage(50)) + " . If at 0 health, you gain +1 health.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var srcEffect = new Protecting(this.owner, target);
            var hp = this.owner.hp > 0 ? 0 : 1;
            this.owner.removeExistingProtections();
            return new CombatSummary(
                this.name,
                this.owner, [
                    new TargetSummary(this.owner, false, true, false, hp, 2, [srcEffect, new Stunned(this.owner)], [], 0),
                    new TargetSummary(target, false, true, false, 0, 0, [new ProtectedBy(target, this.owner, srcEffect)], [], 0)
                ], 3);
        } else {
            return new CombatSummary(
                this.name,
                this.owner, [
                    new TargetSummary(target, false, false, false, 0, 0, [], [], 0)
                ], 3);
        }
    }
}