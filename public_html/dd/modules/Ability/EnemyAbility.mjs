import { getRandomInt, rollDice } from "../DiceRoll.mjs";
import { CombatSummary, TargetSummary, Ability, createDummyTS } from "./Ability.mjs";
import { Exposed, Blind, Stunned, Dodge, Block, Protecting, ProtectedBy } from "../Effect/Effect.mjs";
import { SkeletonSoldier } from "../Class/Enemy.mjs";

export class EnemyAbility extends Ability {
    constructor(name, icon, owner, isAttack) {
        super(name, icon, owner, isAttack)
    }

    choosePlayerTarget(targets) {
        var n = rollDice(100);
        if (n >= 65) {
            return targets[0];
        } else if (n >= 35) {
            return targets[1];
        } else if (n >= 15) {
            return targets[2];
        } else {
            return targets[3];
        }
    }
}

export class CultistBrawlerAbility1 extends EnemyAbility {
    exp_chance = 50;
    constructor(owner) {
        super("Blood for the Old Gods", "img:icon_occultist_ability1", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.exp_chance)) {
            tss[0].effectsGained.push(new Exposed(target));
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}


export class CultistWitchAbility1 extends EnemyAbility {
    blind_chance = 50;
    constructor(owner) {
        super("Cursed Visions", "img:icon_occultist_ability3", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var tss = [];
        if (this.owner.singleTargetHits()) {
            tss = [new TargetSummary(target, true, true, false, 0, 1, [], [], 0)];
            if (this.owner.procs(this.blind_chance)) {
                tss[0].effectsGained.push(new Blind(target));
            }
        } else {
            tss = [new TargetSummary(target, true, false, false, 0, 0, [], [], 0)];
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class SkeletonSoldierAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Graveyard Slash", "img:icon_crusader_ability1", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class SkeletonNobleAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Tempting Goblet", "img:icon_plaguedoctor_ability3", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 1, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class SkeletonDefenderAbility1 extends EnemyAbility {
    move_chance = 50;
    constructor(owner) {
        super("Dead Weight", "img:icon_manatarms_ability1", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 2);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.move_chance)) {
            tss[0].movement = 1;
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class SkeletonCaptainAbility1 extends EnemyAbility {
    stun_chance = 30;
    constructor(owner) {
        super("Bonecrusher", "img:icon_manatarms_ability2", owner, true)
    }

    cast(targets) {
        var tss = [];
        for (var i = 0; i < targets.length; i++) {
            var attack = this.owner.rollToAttack(-1, 1);
            var ts = new TargetSummary(targets[i], true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)
            if (attack.isHit && this.owner.procs(this.stun_chance)) {
                ts.effectsGained.push(new Stunned(targets[i]));
            }
            tss.push(ts);
            tss = tss.concat(attack.tss);
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class RedSpiderAbility1 extends EnemyAbility {
    stun_chance = 30;
    constructor(owner) {
        super("Ensnare", "img:icon_bountyhunter_ability1", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], -1)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.stun_chance)) {
            tss[0].effectsGained.push(new Stunned(target));
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class GreenSpiderAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Acid Spit", "img:icon_plaguedoctor_ability1", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var tss = [];
        if (this.owner.singleTargetHits()) {
            tss = [new TargetSummary(target, true, true, false, 0, 1, [new Exposed(target)], [], 0)];
        } else {
            tss = [new TargetSummary(target, true, false, false, 0, 0, [], [], 0)];
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class GhoulAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Rend", "img:icon_jester_ability2", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 2);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 1, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class GhoulAbility2 extends EnemyAbility {
    stress_chance = 50;
    constructor(owner) {
        super("Howl", "img:icon_jester_ability1", owner, true)
    }

    cast(targets) {
        var tss = [];
        for (var i = 0; i < targets.length; i++) {
            if (this.owner.procs(this.stress_chance)) {
                tss.push(new TargetSummary(targets[i], true, true, false, 0, 1, [], [], 0))
            }
        }
        return new CombatSummary(this.name, this.owner, tss, 2);
    }
}

export class GargoyleAbility1 extends EnemyAbility {
    exp_chance = 30;
    constructor(owner) {
        super("Stone Claws", "img:icon_jester_ability2", owner, true)
    }

    cast(targets) {
        var tss = [];
        var attack1 = this.owner.rollToAttack(0, 2);
        var attack2 = this.owner.rollToAttack(0, 2);
        tss.push(new TargetSummary(targets[0], true, attack1.isHit, attack1.isCrit, attack1.damage, 0, [], [], 0));
        tss.push(new TargetSummary(targets[1], true, attack2.isHit, attack2.isCrit, attack2.damage, 0, [], [], 0));
        if (attack1.isHit && this.owner.procs(this.exp_chance)) {
            tss[0].effectsGained.push(new Exposed(targets[0]));
        }
        if (attack2.isHit && this.owner.procs(this.exp_chance)) {
            tss[1].effectsGained.push(new Exposed(targets[1]));
        }
        tss = tss.concat(attack1.tss);
        tss = tss.concat(attack2.tss);
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class GargoyleAbility2 extends EnemyAbility {
    stun_chance = 70;
    constructor(owner) {
        super("Tail Lash", "img:icon_manatarms_ability2", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 2);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (attack.isHit && this.owner.procs(this.stun_chance)) {
            tss[0].movement = 1;
            tss[0].effectsGained.push(new Stunned(target));
        }
        return new CombatSummary(this.name, this.owner, tss, 2);
    }
}

export class CollectorAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Collect Soul", "img:icon_jester_ability3", owner, true)
    }

    cast(targets) {
        var target = this.choosePlayerTarget(targets);
        var attack = this.owner.rollToAttack(0, 3);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 3, [], [], 0)];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class CollectorAbility2 extends EnemyAbility {
    constructor(owner) {
        super("Cherish Collection", "img:icon_plaguedoctor_ability2", owner, false)
    }

    cast(targets) {
        var tss = [];
        for (var i = 0; i < targets.length; i++) {
            tss.push(new TargetSummary(targets[i], false, true, false, 2, 0, [], [], 0))
        }
        return new CombatSummary(this.name, this.owner, tss, 2);
    }
}

export class ShamblerAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Delirium", "img:icon_antiquarian_ability1", owner, true)
    }

    cast(targets) {
        var tss = [];
        for (var i = 0; i < targets.length; i++) {
            tss.push(new TargetSummary(targets[i], true, true, false, 0, 0, [], [], getRandomInt(7)-3))
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class ShamblerAbility2 extends EnemyAbility {
    exp_chance = 50;
    constructor(owner) {
        super("Undulation", "img:icon_hellion_ability1", owner, true)
    }

    cast(targets) {
        var tss = [];
        for (var i = 0; i < targets.length; i++) {
            var attack = this.owner.rollToAttack(-1, 1);
            var ts = new TargetSummary(targets[i], true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)
            if (attack.isHit && this.owner.procs(this.exp_chance)) {
                ts.effectsGained.push(new Exposed(targets[i]));
            }
            tss.push(ts);
            tss = tss.concat(attack.tss);
        }
        return new CombatSummary(this.name, this.owner, tss, 2);
    }
}

export class ShamblerAbility3 extends EnemyAbility {
    stress_chance = 50;
    constructor(owner) {
        super("Lament", "img:icon_jester_ability1", owner, true)
    }

    cast(targets) {
        var tss = [];
        for (var i = 0; i < targets.length; i++) {
            if (this.owner.procs(this.stress_chance)) {
                tss.push(new TargetSummary(targets[i], true, true, false, 0, 2, [], [], 0))
            }
        }
        return new CombatSummary(this.name, this.owner, tss, 3);
    }
}

export class ShamblerSpawnAbility1 extends EnemyAbility {
    constructor(owner) {
        super("Obstruct", "img:icon_crusader_ability2", owner, false);
    }

    cast(allies, enemies) {
        var tss = [];
        var shambler = allies.find((e) => e.name == "The Shambler");
        if (shambler != undefined) {
            if (this.owner.singleTargetHits()) {
                var srcEffect = new Protecting(this.owner, shambler);
                tss = [
                    new TargetSummary(this.owner, false, true, false, 0, 0, [srcEffect, new Block(this.owner)], [], 0),
                    new TargetSummary(shambler, false, true, false, 1, 1, [new ProtectedBy(shambler, this.owner, srcEffect)], [], 0)];
                this.owner.removeExistingProtections();
            } else {
                tss = [new TargetSummary(shambler, false, false, false, 0, 0, [], [], 0)]
            }
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class ShamblerSpawnAbility2 extends EnemyAbility {
    dodge_chance = 50;
    constructor(owner) {
        super("Flail", "img:icon_graverobber_ability1", owner, true)
    }

    cast(allies, enemies) {
        var target = this.choosePlayerTarget(enemies);
        var attack = this.owner.rollToAttack(0, 1);
        var tss = [new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 0, [], [], 0)];
        tss = tss.concat(attack.tss);
        if (this.owner.procs(this.dodge_chance)) {
            tss.push(new TargetSummary(this.owner, false, true, false, 0, 0, [new Dodge(this.owner)], [], 0));
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class NecromancerAbility1 extends EnemyAbility {
    stress_chance = 50;
    constructor(owner) {
        super("Reanimate", "img:icon_occultist_ability3", owner, true)
    }

    cast(targets) {
        var tss = [];
        if (this.owner.game.enemies.length < 4) {
            this.owner.game.enemies.unshift(new SkeletonSoldier(this.owner.game, 1))
            for (var i = 1; i < this.owner.game.enemies.length; i++) {
                this.owner.game.enemies[i].rank += 1;
            }
            tss.push(createDummyTS(this.owner.game.enemies[0]));
            tss[0].texts["Summoned!"];
            for (var i = 0; i < targets.length; i++) {
                if (this.owner.procs(this.stress_chance)) {
                    tss.push(new TargetSummary(targets[i], true, true, false, 0, 1, [], [], 0));
                }
            }
        }
        return new CombatSummary(this.name, this.owner, tss, 1);
    }
}

export class NecromancerAbility2 extends EnemyAbility {
    constructor(owner) {
        super("Remove Flesh", "img:icon_hellion_ability1", owner, true)
    }

    cast(target) {
        var attack = this.owner.rollToAttack(0, 2);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 1, [new Exposed(target), new Exposed(target)], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [], [], 1)
        ];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 2);
    }
}

export class NecromancerAbility3 extends EnemyAbility {
    constructor(owner) {
        super("Six Feet Under", "img:icon_crusader_ability1", owner, true)
    }

    cast(target) {
        var attack = this.owner.rollToAttack(0, 2);
        var tss = [
            new TargetSummary(target, true, attack.isHit, attack.isCrit, attack.damage, 1, [new Stunned(target)], [], 0),
            new TargetSummary(this.owner, false, true, false, 0, 0, [], [], 1)
        ];
        tss = tss.concat(attack.tss);
        return new CombatSummary(this.name, this.owner, tss, 3);
    }
}