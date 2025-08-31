import { Character } from "./Character.mjs";
import { AntiquarianAbility1, AntiquarianAbility2, AntiquarianAbility3, AntiquarianPassive, H_AntiquarianAbility1, H_AntiquarianAbility2, H_AntiquarianAbility3 } from "../Ability/AntiquarianAbility.mjs";
import { BountyHunterAbility1, BountyHunterAbility2, BountyHunterAbility3, BountyHunterPassive, H_BountyHunterAbility1, H_BountyHunterAbility2, H_BountyHunterAbility3 } from "../Ability/BountyHunterAbility.mjs";
import { CrusaderAbility1, CrusaderAbility2, CrusaderAbility3, CrusaderPassive, H_CrusaderAbility1, H_CrusaderAbility2, H_CrusaderAbility3 } from "../Ability/CrusaderAbility.mjs";
import { GraveRobberAbility1, GraveRobberAbility2, GraveRobberAbility3, GraveRobberPassive, H_GraveRobberAbility1, H_GraveRobberAbility2, H_GraveRobberAbility3 } from "../Ability/GraveRobberAbility.mjs";
import { HellionAbility1, HellionAbility2, HellionAbility3, H_HellionAbility1, H_HellionAbility2, H_HellionAbility3, HellionPassive } from "../Ability/HellionAbility.mjs";
import { JesterAbility1, JesterAbility2, JesterAbility3, H_JesterAbility1, H_JesterAbility2, H_JesterAbility3, JesterPassive } from "../Ability/JesterAbility.mjs";
import { LeperAbility1, LeperAbility2, LeperAbility3, H_LeperAbility1, H_LeperAbility2, H_LeperAbility3, LeperPassive } from "../Ability/LeperAbility.mjs";
import { ManAtArmsAbility1, ManAtArmsAbility2, ManAtArmsAbility3, H_ManAtArmsAbility1, H_ManAtArmsAbility2, H_ManAtArmsAbility3, ManAtArmsPassive } from "../Ability/ManAtArmsAbility.mjs";
import { OccultistAbility1, OccultistAbility2, OccultistAbility3, H_OccultistAbility1, H_OccultistAbility2, H_OccultistAbility3, OccultistPassive } from "../Ability/OccultistAbility.mjs";
import { PlagueDoctorAbility1, PlagueDoctorAbility2, PlagueDoctorAbility3, H_PlagueDoctorAbility1, H_PlagueDoctorAbility2, H_PlagueDoctorAbility3, PlagueDoctorPassive } from "../Ability/PlagueDoctorAbility.mjs";
import { TargetSummary, SwapPosition } from "../Ability/Ability.mjs";
import { Crit, Dazed, Dodge, Exposed, SuperBlock, SuperDodge } from "../Effect.mjs";


export class PlayerCharacter extends Character {
    socket = undefined;
    onDeathsDoor = false;
    stress = 0;
    maxStress = 0;
    isHopeless = false;
    h_abilities = [];
    passive = undefined;
    sips = 0;
    strength = 1;
    title = "";
    id = 0;
    level = 1;
    swapAbility = undefined;
    constructor(game, playerName, maxHp, maxStress, isClient, rank, socket) {
        super(game, playerName, maxHp, isClient, rank);
        this.socket = socket;
        this.onDeathsDoor = false;
        this.stress = 0;
        this.maxStress = maxStress;
        this.isHopeless = false;
        this.strength = 1;
        this.sips = 0;
        this.level = 1;
        this.swapAbility = new SwapPosition(this);
        this.chooseAct = this.chooseAct.bind(this);
    }
    chooseAct(allies, enemies) {
        // This should send a query to the client
        if (!this.isClient) {
            this.game.chooseAbilityPopup(
                this,
                this.abilities,
                [
                    () => {this.abilities[0].actHost(allies, enemies)},
                    () => {this.abilities[1].actHost(allies, enemies)},
                    () => {this.abilities[2].actHost(allies, enemies)}
                ]
            );
        }
    }
    takeDamage(n) {
        if (n > 0) {
            if (this.hp > 0) {
                this.hp = Math.max(this.hp-n, 0);
                this.sips += n;
                return ["-" + n + " HP"];
            } else {
                if (!this.onDeathsDoor) {
                    this.onDeathsDoor = true;
                }
                this.sips += 6;
                return ["DEATHS DOOR!"];
            }
        } else {
            return [];
        }
    }
    heal(n) {
        if (n > 0) {
            this.hp = Math.min(this.hp+n, this.maxHp);
            if (this.hp > 0 && this.onDeathsDoor) {
                this.onDeathsDoor = false;
                return ["+" + n + " HP", "Escaped Death's Door!"]
            } else {
                return ["+" + n + " HP"];
            }
        } else {
            return [];
        }
    }
    gainStress(n) {
        if (n > 0) {
            this.stress = Math.min(this.stress+n, this.maxStress);
            if (this.maxStress == this.stress && !this.isHopeless) {
                this.isHopeless = true;
                return ["+" + n + " stress", "HOPELESS!"];
            } else {
                return ["+" + n + " stress"];
            }
        } else {
            return [];
        }
    }
    loseStress(n) {
        if (n > 0) {
            this.stress = Math.max(this.stress-n, 0);
            if (this.stress == 0 && this.isHopeless) {
                this.isHopeless = false;
                return ["-" + n + " stress", "No longer Hopeless!"];
            } else {
                return ["-" + n + " stress"];
            }
        } else {
            return [];
        }
    }
    onTurnStart() {
        var doSkip = false;
        var tss = [];
        if (this.isHopeless && !this.procs(75)) {
            doSkip = true;
            var ts = new TargetSummary(this, true, false, true, 0, 0, [], [], 0)
            ts.texts.push("Hopeless...");
            tss.push(ts);
        }
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            switch (effect.name) {
                case ("stunned"):
                    if (!doSkip) {
                        doSkip = true;
                        effect.proc = true;
                        var ts = new TargetSummary(this, true, true, false, 0, 0, [new Dazed(this)], [], 0)
                        ts.texts.push("Stunned!");
                        tss.push(ts);
                    }
                    break;
                case ("dazed"):
                    if (!doSkip) {
                        effect.proc = true;
                    }
                    break;
                case ("rage"):
                    var rageProc = !this.procs(75);
                    if (rageProc && !doSkip) {
                        doSkip = true;
                        effect.proc = true;
                        var ts = new TargetSummary(this, true, true, false, 0, 1, [], [], 0)
                        ts.texts.push("Raging!");
                        tss.push(ts);
                    }
                    break;
            }
        }
        return {doSkip : doSkip, tss : tss};
    }
    isDead() {
        return false //this.onDeathsDoor;
    }
    onStressGain(ts) {
        return [];
    }
    onStressLost(ts) {
        return [];
    }
};

export class Antiquarian extends PlayerCharacter {
    anim_idle     = "img:antiquarian_idle";
    anim_ability1 = "img:antiquarian_ability1";
    anim_ability2 = "img:antiquarian_ability2";
    anim_ability3 = "img:antiquarian_ability3";
    anim_defend   = "img:antiquarian_defend";
    title = "Antiquarian";
    id = 1;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 3, 3, isClient, rank, socket)
        this.passive = new AntiquarianPassive(this);
        this.abilities = [
            new AntiquarianAbility1(this),
            new AntiquarianAbility2(this),
            new AntiquarianAbility3(this)];
        this.h_abilities = [
            new H_AntiquarianAbility1(this),
            new H_AntiquarianAbility2(this),
            new H_AntiquarianAbility3(this)]
    }
    lootBonus() {
        if (!this.isHopeless) {
            return this.procs(50);
        } else {
            return false;
        }
    }
}

export class BountyHunter extends PlayerCharacter {
    anim_idle     = "img:bountyhunter_idle";
    anim_ability1 = "img:bountyhunter_ability1";
    anim_ability2 = "img:bountyhunter_ability2";
    anim_ability3 = "img:bountyhunter_ability3";
    anim_defend   = "img:bountyhunter_defend";
    title = "Bounty Hunter";
    id = 2;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 4, 3, isClient, rank, socket)
        this.passive = new BountyHunterPassive(this);
        this.abilities = [
            new BountyHunterAbility1(this),
            new BountyHunterAbility2(this),
            new BountyHunterAbility3(this)];
        this.h_abilities = [
            new H_BountyHunterAbility1(this),
            new H_BountyHunterAbility2(this),
            new H_BountyHunterAbility3(this)];
    }
    onTakeDamage(ts) {
        if (!this.isHopeless) {
            return [new TargetSummary(this, false, true, false, 0, 0, [new Dodge(this)], [], 0)];
        } else {
            return [];
        }
    }
}

export class Crusader extends PlayerCharacter {
    anim_idle     = "img:crusader_idle";
    anim_ability1 = "img:crusader_ability1";
    anim_ability2 = "img:crusader_ability2";
    anim_ability3 = "img:crusader_ability3";
    anim_defend   = "img:crusader_defend";
    title = "Crusader";
    id = 3;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 4, 3, isClient, rank, socket)
        this.passive = new CrusaderPassive(this);
        this.abilities = [
            new CrusaderAbility1(this),
            new CrusaderAbility2(this),
            new CrusaderAbility3(this)];
        this.h_abilities = [
            new H_CrusaderAbility1(this),
            new H_CrusaderAbility2(this),
            new H_CrusaderAbility3(this)];
    }
    onStressLost(ts) {
        if (!this.isHopeless) {
            ts.stress += 1;
        }
        return [];
    }
}

export class GraveRobber extends PlayerCharacter {
    anim_idle     = "img:graverobber_idle";
    anim_ability1 = "img:graverobber_ability1";
    anim_ability2 = "img:graverobber_ability2";
    anim_ability3 = "img:graverobber_ability3";
    anim_defend   = "img:graverobber_defend";
    title = "Grave Robber";
    id = 4;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 3, 3, isClient, rank, socket)
        this.passive = new GraveRobberPassive(this);
        this.abilities = [
            new GraveRobberAbility1(this),
            new GraveRobberAbility2(this),
            new GraveRobberAbility3(this)];
        this.h_abilities = [
            new H_GraveRobberAbility1(this),
            new H_GraveRobberAbility2(this),
            new H_GraveRobberAbility3(this)];
    }
    onCombatStart() {
        if (!this.isHopeless) {
            this.effects.push(new Crit(this));
        }
    }
    // onGainEffect(ts) {
    //     if (!this.isHopeless) {
    //         for (var i = 0; i < ts.effectsGained.length; i++) {
    //             var effect = ts.effectsGained[i];
    //             if (effect.name == "dodge") {
    //                 ts.effectsGained[i] = new SuperDodge(effect.owner);
    //             }
    //         }
    //     }
    //     return [];
    // }
}

export class Hellion extends PlayerCharacter {
    anim_idle     = "img:hellion_idle";
    anim_ability1 = "img:hellion_ability1";
    anim_ability2 = "img:hellion_ability2";
    anim_ability3 = "img:hellion_ability3";
    anim_defend   = "img:hellion_defend";
    title = "Hellion";
    id = 5;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 4, 3, isClient, rank, socket)
        this.passive = new HellionPassive(this);
        this.abilities = [
            new HellionAbility1(this),
            new HellionAbility2(this),
            new HellionAbility3(this)];
        this.h_abilities = [
            new H_HellionAbility1(this),
            new H_HellionAbility2(this),
            new H_HellionAbility3(this)];
    }
    onCrit() {
        if (!this.isHopeless) {
            return [new TargetSummary(this, false, true, false, 0, 1, [], [], 0)];
        } else {
            return [];
        }
        
    }
    /*onRemoveEffect(ts) {
        if (!this.isHopeless) {
            var debuffs = 0;
            for (var i = 0; i < ts.effectsLost.length; i++) {
                var effect = ts.effectsLost[i];
                if (effect.isDebuff) {
                    debuffs += 1;
                }
            }
            if (debuffs > 0) {
                return [new TargetSummary(this, false, true, false, 0, debuffs, [], [], 0)];
            } else {
                return [];
            }
        } else {
            return [];
        }
    }*/
}

export class Jester extends PlayerCharacter {
    anim_idle     = "img:jester_idle";
    anim_ability1 = "img:jester_ability1";
    anim_ability2 = "img:jester_ability2";
    anim_ability3 = "img:jester_ability3";
    anim_defend   = "img:jester_defend";
    title = "Jester";
    id = 6;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 3, 3, isClient, rank, socket)
        this.passive = new JesterPassive(this);
        this.abilities = [
            new JesterAbility1(this),
            new JesterAbility2(this),
            new JesterAbility3(this)];
        this.h_abilities = [
            new H_JesterAbility1(this),
            new H_JesterAbility2(this),
            new H_JesterAbility3(this)];
    }
    onTakeDamage(ts) {
        if (!this.isHopeless && this.game.inCombat) {
            var attacker = this.game.currentChar // i guess?
            return [new TargetSummary(attacker, true, true, false, 0, 0, [new Exposed(attacker)], [], 0)];
        } else {
            return []
        }
    }
    onCombatStart() {
        this.abilities[2].targetRanks = [-1,-2,-3,-4];
        this.h_abilities[2].targetRanks = [-1,-2,-3,-4];
    }
}

export class Leper extends PlayerCharacter {
    anim_idle     = "img:leper_idle";
    anim_ability1 = "img:leper_ability1";
    anim_ability2 = "img:leper_ability2";
    anim_ability3 = "img:leper_ability3";
    anim_defend   = "img:leper_defend";
    title = "Leper";
    id = 7;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 4, 3, isClient, rank, socket)
        this.passive = new LeperPassive(this);
        this.abilities = [
            new LeperAbility1(this),
            new LeperAbility2(this),
            new LeperAbility3(this)];
        this.h_abilities = [
            new H_LeperAbility1(this),
            new H_LeperAbility2(this),
            new H_LeperAbility3(this)];
    }

    onTakeDamage(ts) {
        if (!this.isHopeless && ts.hp > 0 && this.hp - ts.hp <= 0) {
            return [new TargetSummary(this, false, true, false, 0, 0, [new SuperBlock(this)], [], 0)];
        } else {
            return [];
        }
    }
}

export class ManAtArms extends PlayerCharacter {
    anim_idle     = "img:manatarms_idle";
    anim_ability1 = "img:manatarms_ability1";
    anim_ability2 = "img:manatarms_ability2";
    anim_ability3 = "img:manatarms_ability3";
    anim_defend   = "img:manatarms_defend";
    title = "Man-at-Arms";
    id = 8;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 4, 3, isClient, rank, socket);
        this.passive = new ManAtArmsPassive(this);
        this.abilities = [
            new ManAtArmsAbility1(this),
            new ManAtArmsAbility2(this),
            new ManAtArmsAbility3(this)];
        this.h_abilities = [
            new H_ManAtArmsAbility1(this),
            new H_ManAtArmsAbility2(this),
            new H_ManAtArmsAbility3(this)];
    }

    handleEffects(ts) {
        var tss = [ts];
        tss = tss.concat(this.procSuperDodge(ts));
        tss = tss.concat(this.procDodge(ts));
        tss = tss.concat(this.procSuperBlock(ts));
        tss = tss.concat(this.procBlock(ts));
        tss = tss.concat(this.procExposed(ts));
        if (!this.isHopeless) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                if (effect.name == "protecting" && effect.proc) {
                    tss.push(new TargetSummary(this, false, true, false, 0, 1, [], [], 0));
                }
            }
        }
        return tss;
    }
}

export class Occultist extends PlayerCharacter {
    anim_idle     = "img:occultist_idle";
    anim_ability1 = "img:occultist_ability1";
    anim_ability2 = "img:occultist_ability2";
    anim_ability3 = "img:occultist_ability3";
    anim_defend   = "img:occultist_defend";
    title = "Occultist";
    id = 9;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 3, 3, isClient, rank, socket)
        this.passive = new OccultistPassive(this);
        this.abilities = [
            new OccultistAbility1(this),
            new OccultistAbility2(this),
            new OccultistAbility3(this)];
        this.h_abilities = [
            new H_OccultistAbility1(this),
            new H_OccultistAbility2(this),
            new H_OccultistAbility3(this)];
    }
}

export class PlagueDoctor extends PlayerCharacter {
    anim_idle     = "img:plaguedoctor_idle";
    anim_ability1 = "img:plaguedoctor_ability1";
    anim_ability2 = "img:plaguedoctor_ability2";
    anim_ability3 = "img:plaguedoctor_ability3";
    anim_defend   = "img:plaguedoctor_defend";
    title = "Plague Doctor";
    id = 10;
    constructor(game, playerName, isClient, rank, socket) {
        super(game, playerName, 3, 3, isClient, rank, socket)
        this.passive = new PlagueDoctorPassive(this);
        this.abilities = [
            new PlagueDoctorAbility1(this),
            new PlagueDoctorAbility2(this),
            new PlagueDoctorAbility3(this)];
        this.h_abilities = [
            new H_PlagueDoctorAbility1(this),
            new H_PlagueDoctorAbility2(this),
            new H_PlagueDoctorAbility3(this)];
    }

    onHealed(ts) {
        if (!this.isHopeless) {
            ts.hp += 1;
        }
        return [];
    }
}