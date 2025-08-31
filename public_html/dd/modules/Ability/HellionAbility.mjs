import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit, Rage } from "../Effect/Effect.mjs";

export class HellionPassive extends Ability {
    constructor(owner) {
        super("[Passive] Bloodlust", "img:icon_hellion_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you critically strike, gain -1 stress.</span>";
    }

    getRanks() {
        return "";
    }
}

export class HellionAbility1 extends Ability {
    constructor(owner) {
        super("Bleed Out", "img:icon_hellion_ability1", owner, true, [1], [], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        return "<span>Attack - On hit: Deal " + damage + " damage.<br>"
            + "Gain two " + Rage.getImage(50) + ".</span>";
    }

    getRanks() {
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | Target enemy: 1+2</span><br>";
    }

    cast(targets) {
        var enemies = targets[1];
        var attack1 = this.owner.rollToAttack(0, this.owner.strength+1);
        var attack2 = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Rage(this.owner), new Rage(this.owner)], [], 0)
        ]
        if (enemies.length > 0) {
            tss.push(new TargetSummary(enemies[0], true, attack1.isHit, attack1.isCrit, attack1.damage, 0, [], [], 0));
        }
        if (enemies.length > 1) {
            tss.push(new TargetSummary(enemies[1], true, attack2.isHit, attack2.isCrit, attack2.damage, 0, [], [], 0));
        }
        tss = tss.concat(attack1.tss);
        tss = tss.concat(attack2.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_HellionAbility1 extends Ability {
    constructor(owner) {
        super("Bleed Out", "img:icon_hellion_ability1", owner, true, [1], [], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        return "<span>Attack - On hit: Deal " + damage + " damage.<br>"
            + "Gain two " + Rage.getImage(50) + HGain(" and one " + Exposed.getImage(50)) + ".</span>";
    }

    getRanks() {
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | Target enemy: 1+2</span><br>";
    }

    cast(targets) {
        var enemies = targets[1];
        var attack1 = this.owner.rollToAttack(0, this.owner.strength+1);
        var attack2 = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [
            new TargetSummary(enemies[0], true, attack1.isHit, attack1.isCrit, attack1.damage, 0, [], [], 0),
            new TargetSummary(enemies[1], true, attack2.isHit, attack2.isCrit, attack2.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Rage(this.owner), new Rage(this.owner), new Exposed(this.owner)], [], 0)
        ];
        tss = tss.concat(attack1.tss);
        tss = tss.concat(attack2.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class HellionAbility2 extends Ability {
    constructor(owner) {
        super("Hack", "img:icon_hellion_ability2", owner, true, [1,2], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        return "<span>Attack - On hit: Deal " + damage + " damage.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class H_HellionAbility2 extends Ability {
    constructor(owner) {
        super("Hack", "img:icon_hellion_ability2", owner, true, [1,2], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        return "<span>Attack - On hit: Deal " + damage + " damage.<br>"
            + HGain("Gain " + Exposed.getImage(50)) + ".</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [new Exposed(this.owner)], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(
            this.name, this.owner, tss, 2);
    }
}

export class HellionAbility3 extends Ability {
    constructor(owner) {
        super("Adrenaline Rush", "img:icon_hellion_ability3", owner, false, [1,2,3,4], [], false);
    }

    getDescription() {
        return "<span>Remove all debuffs. Gain 1 HP for each removed.</span>";
    }

    cast(targets) {
        var debuffs = this.owner.getAllDebuffs();
        var tss = [new TargetSummary(this.owner, false, true, false, debuffs.length, 0, [], debuffs, 0)];
        return new CombatSummary(
            this.name, this.owner, tss, 3);
    }
}

export class H_HellionAbility3 extends Ability {
    constructor(owner) {
        super("Adrenaline Rush", "img:icon_hellion_ability3", owner, false, [1,2,3,4], [], false);
    }

    getDescription() {
        return "<span>Remove all debuffs. Gain 1 HP " + HGain("if any were removed") + ".</span>";
    }

    cast(targets) {
        var debuffs = this.owner.getAllDebuffs();
        var tss = [new TargetSummary(this.owner, false, true, false, debuffs.length > 0 ? 1 : 0, 0, [], debuffs, 0)];
        return new CombatSummary(
            this.name, this.owner, tss, 3);
    }
}