import { HGain, HLose, Ability, CombatSummary, TargetSummary } from "./Ability.mjs";
import { Stunned, Protecting, ProtectedBy } from "../Effect/Effect.mjs";

export class CrusaderPassive extends Ability {
    constructor(owner) {
        super("[Passive] Faith in the Flame", "img:icon_crusader_passive", owner, false, [], [], false);
    }

    getDescription() {
        return "<span>Whenever you lose stress, lose 1 extra.</span>";
    }

    getRanks() {
        return "";
    }
}

export class CrusaderAbility1 extends Ability {
    stun_chance = 15;
    constructor(owner) {
        super("Smite", "img:icon_crusader_ability1", owner, true, [1,2], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        var stunOdds = this.owner.getOdds(this.stun_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + stunOdds + "%]: Target gains " + Stunned.getImage(50) + " and you gain -1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.stun_chance)) {
            tss[0].effectsGained.push(new Stunned(target));
            tss.push(new TargetSummary(this.owner, false, true, false, 0, 1, [], [], 0));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }
}

export class H_CrusaderAbility1 extends Ability {
    stun_chance = 15;
    constructor(owner) {
        super("Smite", "img:icon_crusader_ability1", owner, true, [1], [-1,-2], false);
    }

    getDescription() {
        var damage = this.owner.strength+1;
        var stunOdds = this.owner.getOdds(this.stun_chance);
        return "<span>Attack - On hit: Deal " + damage + " damage. Bonus [" + stunOdds + "%]: Target gains " + Stunned.getImage(50) + " and you gain -1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        var attack = this.owner.rollToAttack(0, this.owner.strength+1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.stun_chance)) {
            tss[0].effectsGained.push(new Stunned(target));
            tss.push(new TargetSummary(this.owner, false, true, false, 0, 1, [], [], 0));
        }
        return new CombatSummary(
            this.name, this.owner, tss, 1);
    }

    getRanks() {
        var targets = "Target enemy: " + this.targetRanks.map((t) => Math.abs(t));
        return "<span style='font-size:40px'>" + HGain("Pos: " + this.usableRanks.toString()) + " | " + targets + "</span><br>";
    }
}

export class CrusaderAbility2 extends Ability {
    constructor(owner) {
        super(
            "Bulwark",
            "img:icon_crusader_ability2", owner, false, [1,2], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>Protect another ally. Target gains +1 HP and -1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var srcEffect = new Protecting(this.owner, target);
            var tss = [
                new TargetSummary(this.owner, false, true, false, 0, 0, [srcEffect], [], 0),
                new TargetSummary(target, false, true, false, 1, 1, [new ProtectedBy(target, this.owner, srcEffect)], [], 0)];
            tss = tss.concat(this.owner.onHealing(tss[1]));
            this.owner.removeExistingProtections();
            return new CombatSummary(
                this.name,
                this.owner, tss, 2);
        } else {
            return new CombatSummary(
                this.name,
                this.owner, [new TargetSummary(target, false, false, false, 0, 0, [], [], 0)], 2);
        }
    }
}

export class H_CrusaderAbility2 extends Ability {
    constructor(owner) {
        super(
            "Bulwark",
            "img:icon_crusader_ability2", owner, false, [1], [1,2,3,4], false);
    }

    getDescription() {
        return "<span>Protect another ally. Target gains " + HLose("+1 HP") + " and -1 stress.</span>";
    }

    cast(targets) {
        var target = targets[0];
        if (this.owner.singleTargetHits()) {
            var srcEffect = new Protecting(this.owner, target);
            this.owner.removeExistingProtections();
            return new CombatSummary(
                this.name,
                this.owner, [
                    new TargetSummary(this.owner, false, true, false, 0, 0, [srcEffect], [], 0),
                    new TargetSummary(target, false, true, false, 1, 1, [new ProtectedBy(target, this.owner, srcEffect)], [], 0)
                ], 2);
        } else {
            return new CombatSummary(
                this.name,
                this.owner, [
                    new TargetSummary(target, false, false, false, 0, 0, [], [], 0)
                ], 2);
        }
    }

    getRanks() {
        var targets = "Target ally: " + this.targetRanks.toString();
        return "<span style='font-size:40px'>" + HGain("Pos: " + this.usableRanks.toString()) + " | " + targets + "</span><br>";
    }
}

export class CrusaderAbility3 extends Ability {
    constructor(owner) {
        super(
            "Divine Intervention",
            "img:icon_crusader_ability3", owner, false, [1,2,3,4], [], false);
    }

    getDescription() {
        return "<span>If you have 0 HP, all players gain +1 HP.<br>If <i>all</i> players have 0 HP, all players gain full HP</span>";
    }

    getRanks() {
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | Targets all allies</span><br>";
    }

    cast(targets) {
        var allies = targets[0];
        if (this.owner.hp == 0) {
            var allZero = true;
            for (var i = 0; i < allies.length; i++) {
                if (allies[i].hp > 0) {
                    allZero = false;
                }
            }
            if (allZero) {
                var ts = [];
                for (var i = 0; i < allies.length; i++) {
                    ts.push(new TargetSummary(allies[i], false, true, false, allies[i].maxHp, 0, [], [], 0));
                }
                return new CombatSummary(
                    "Divine Intervention",
                    this.owner, ts, 3);
            } else {
                var ts = [];
                for (var i = 0; i < allies.length; i++) {
                    ts.push(new TargetSummary(allies[i], false, true, true, 1, 0, [], [], 0));
                }
                return new CombatSummary(
                    "Divine Intervention",
                    this.owner, ts, 3);
            }
        } else {
            return new CombatSummary("Divine Intervention", this.owner, [], 3);
        }
    }
}

export class H_CrusaderAbility3 extends Ability {
    constructor(owner) {
        super(
            "Divine Intervention",
            "img:icon_crusader_ability3", owner, false, [1], [], false);
    }

    getDescription() {
        return "<span>" + HLose("If you have 0 HP, all players gain +1 HP.") + "<br>If <i>all</i> players have 0 HP, all players gain full HP</span>";
    }

    getRanks() {
        return "<span style='font-size:40px'>" + HGain("Pos: " + this.usableRanks.toString()) + " | Targets all allies</span><br>";
    }

    cast(targets) {
        var allies = targets[0];
        var allZero = true;
        for (var i = 0; i < allies.length; i++) {
            if (allies[i].hp > 0) {
                allZero = false;
            }
        }
        if (allZero) {
            var ts = [];
            for (var i = 0; i < allies.length; i++) {
                ts.push(new TargetSummary(allies[i], false, true, false, allies[i].maxHp, 0, [], [], 0));
            }
            return new CombatSummary(
                "Divine Intervention",
                this.owner, ts, 3);
        } else {
            return new CombatSummary("Divine Intervention", this.owner, [], 3);
        }
    }
}