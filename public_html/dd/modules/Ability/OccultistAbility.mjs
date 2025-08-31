import { HPower, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Exposed, Dodge, Crit } from "../Effect/Effect.mjs";

export class OccultistPassive extends Ability {
    constructor(owner) {
        super("[Passive] One with Nothing", "img:icon_occultist_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Your abilities are weakened.</span>";
    }

    getRanks() {
        return "";
    }
}

export class OccultistAbility1 extends Ability {
    constructor(owner) {
        super("Sacrificial Stab", "img:icon_occultist_ability1", owner, true, [1,2,3], [-1,-2,-3], false);
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
            this.name, this.owner, tss, 1);
    }
}

export class H_OccultistAbility1 extends Ability {
    crit_chance = 50;
    constructor(owner) {
        super("Sacrificial Stab", "img:icon_occultist_ability1", owner, true, [1,2,3], [-1,-2,-3], false);
    }

    getDescription() {
        var damage = this.owner.strength;
        var critOdds = this.owner.getOdds(this.crit_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. " + HPower("Bonus [" + critOdds + "%]: Gain " + Crit.getImage(50) + ".") + "</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.crit_chance)) {
            tss.push(new TargetSummary(this.owner, false, true, false, 0, 0, [new Crit(this.owner)], [], 0));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class OccultistAbility2 extends Ability {
    heal_amount = 2
    heal_chance = 75;
    constructor(owner) {
        super("Wyrd Reconstruction", "img:icon_occultist_ability2", owner, false, [1,2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        var healOdds = this.owner.getOdds(this.heal_chance);
        return "<span>[" + healOdds + "%]: Target gains +" + this.heal_amount + " HP.<br>[" + (100 - healOdds) + "%]: Target takes 1 damage.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [];
            if (this.owner.procs(this.heal_chance)) {
                tss = [new TargetSummary(target, false, true, false, 2, 0, [], [], 0)];
                tss = tss.concat(this.owner.onHealing(tss[0]));
            } else {
                tss = [new TargetSummary(target, true, true, false, 1, 0, [], [], 0)];
            }
            return new CombatSummary(
                this.name, this.owner, tss, 2);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 2);
        }
    }
}

export class H_OccultistAbility2 extends Ability {
    heal_amount = 3
    heal_chance = 75;
    constructor(owner) {
        super("Wyrd Reconstruction", "img:icon_occultist_ability2", owner, false, [1,2,3,4], [1,2,3,4], true);
    }

    getDescription() {
        var healOdds = this.owner.getOdds(this.heal_chance);
        return "<span>[" + healOdds + "%]: Target gains " + HPower("+" + this.heal_amount + " HP") + ".<br>[" + (100 - healOdds) + "%]: Target takes 1 damage.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [];
            if (this.owner.procs(this.heal_chance)) {
                tss = [new TargetSummary(target, false, true, false, 3, 0, [], [], 0)];
                tss = tss.concat(this.owner.onHealing(tss[0]));
            } else {
                tss = [new TargetSummary(target, true, true, false, 1, 0, [], [], 0)];
            }
            return new CombatSummary(
                this.name, this.owner, tss, 2);
        } else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 2);
        }
    }
}

export class OccultistAbility3 extends Ability {
    constructor(owner) {
        super("Mortality Hex", "img:icon_occultist_ability3", owner, true, [2,3,4], [-1,-2,-3,-4], false);
    }

    getDescription() {
        return "<span>Target gains one " + Exposed.getImage(50) + " for each corpse. Clear all corpses.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [new TargetSummary(target, true, true, false, 0, 0, [], [], 0)];
            var exposeds = [];
            for (var i = 0; i < this.owner.game.enemies.length; i++) {
                var enemy = this.owner.game.enemies[i];
                if (enemy.isDead()) {
                    tss.push(new TargetSummary(enemy, true, true, false, 1, 0, [], [], 0));
                    exposeds.push(new Exposed(target))
                }
            }
            tss[0].effectsGained = exposeds;
            return new CombatSummary(
                this.name, this.owner, tss, 3);
        }  else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, true, false, false, 0, 0, [], [], 0)], 3);
        }
    }
}

export class H_OccultistAbility3 extends Ability {
    stun_chance = 50;
    constructor(owner) {
        super("Mortality Hex", "img:icon_occultist_ability3", owner, true, [2,3,4], [-1,-2,-3,-4], false);
    }

    getDescription() {
        var stunOdds = this.owner.getOdds(this.stun_chance);
        return "<span>Target gains one " + Exposed.getImage(50) + " for each corpse. Clear all corpses.<br>" + HPower("Bonus [" + stunOdds + "%]: Target gains " + Stunned.getImage(50) + ".") + "</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var tss = [new TargetSummary(target, true, true, false, 0, 0, [], [], 0)];
            var exposeds = [];
            for (var i = 0; i < this.owner.game.enemies.length; i++) {
                var enemy = this.owner.game.enemies[i];
                if (enemy.isDead()) {
                    tss.push(new TargetSummary(enemy, true, true, false, 1, 0, [], [], 0));
                    exposeds.push(new Exposed(target))
                }
            }
            if (this.owner.procs(this.stun_chance)) {
                tss[0].effectsGained = [new Stunned(target)];
            }
            tss[0].effectsGained = exposeds;
            return new CombatSummary(
                this.name, this.owner, tss, 3);
        }  else {
            return new CombatSummary(
                this.name, this.owner, [new TargetSummary(target, true, false, false, 0, 0, [], [], 0)], 3);
        }
    }
}