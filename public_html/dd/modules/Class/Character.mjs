import { rollDice } from "../DiceRoll.mjs";
import { TargetSummary } from "../Ability/Ability.mjs";
import { Dazed } from "../Effect/Effect.mjs";

export class Character {
    name = "";
    hp = 0;
    maxHp = 0;
    isClient = false;
    effects = [];
    abilities = [];
    rank = 0;
    anim_idle = "";
    anim_ability1 = "";
    anim_ability2 = "";
    anim_ability3 = "";
    anim_defend = "";
    constructor(game, name, maxHp, isClient, rank) {
        this.game = game;
        this.name = name;
        this.hp = maxHp;
        this.maxHp = maxHp;
        this.isClient = isClient;
        this.abilities = [];
        this.rank = rank;
    }
    getAnimIdle() {
        return this.anim_idle;
    }
    getAnimAbility(n) {
        switch (n) {
            case -1:
                return this.anim_defend;
            case 1:
                return this.anim_ability1;
            case 2:
                return this.anim_ability2;
            case 3:
                return this.anim_ability3;
            default:
                return this.anim_idle;
        }
    }
    getAnimDefend() {
        return this.anim_defend;
    }
    getEffects() {
        return this.effects.sort((e1,e2) => e1.name.localeCompare(e2.name));
    }
    isDead() {
        return this.hp == 0;
    }
    isLucky () {
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if (effect.name == "foresight") {
                return true;
            }
        }
        return false;
    }
    getOdds(odds) {
        if (this.isLucky()) {
            return 100 - (1 - odds / 100) * (1 - odds / 100) * 100;
        } else {
            return odds;
        }
    }
    procs(odds) {
        if (this.isLucky()) {
            return (rollDice(100) < odds || rollDice(100) < odds);
        } else {
            return (rollDice(100) < odds)
        }
    }
    singleTargetHits() {
        return !this.procBlind();
    }
    rollToAttack(bonus, damage) {
        if (this.singleTargetHits()) {
            var hitRoll = this.isLucky() ? Math.max(rollDice(6),rollDice(6)) + bonus : rollDice(6) + bonus;
            if (hitRoll <= 1) {
                return {isHit : false, isCrit : false, damage : 0, tss : this.onMiss()};
            } else {
                var scProc = this.procSuperCrit();
                if (scProc.procs) {
                    return {isHit : true, isCrit : true, damage : damage+damage*scProc.bonus, tss : this.onCrit()};
                } else {
                    var cProc = this.procCrit()
                    if (cProc.procs) {
                        return {isHit : true, isCrit : true, damage : damage+damage*cProc.bonus, tss : this.onCrit()};
                    } else {
                        if (hitRoll >= 6) {
                            return {isHit : true, isCrit : true, damage : damage*2, tss : this.onCrit()};
                        } else {
                            return {isHit : true, isCrit : false, damage : damage, tss : []};
                        }
                    }
                }
            }
        } else {
            return {isHit : false, isCrit : false, damage : 0, tss : this.onMiss()};
        }
    }
    getAllDebuffs() {
        var debuffs = [];
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if (effect.isDebuff) {
                debuffs.push(effect.name);
            }
        }
        return debuffs;
    }
    procSuperCrit() {
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if (effect.name == "supercrit") {
                effect.proc = true;
                return {procs : true, bonus : effect.bonus};
            }
        }
        return {procs : false, bonus : 0};
    }
    procCrit() {
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if (effect.name == "crit") {
                effect.proc = true;
                return {procs : true, bonus : effect.bonus};
            }
        }
        return {procs : false, bonus : 0};
    }
    procBlind() {
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if (effect.name == "blind") {
                if (!this.procs(effect.chance*100)) {
                    effect.proc = true;
                    return true;
                }
            }
        }
        return false;
    }
    procSuperDodge(ts) {
        if (ts.isAttack && ts.isHit) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                if (effect.name == "superdodge") {
                    if (this.procs(effect.chance*100)) {
                        ts.isHit = false;
                        ts.isCrit = false;
                        effect.proc = true;
                        return [];
                    }
                }
            }
        }
        return [];
    }
    procDodge(ts) {
        if (ts.isAttack && ts.isHit) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                if (effect.name == "dodge") {
                    if (this.procs(effect.chance*100)) {
                        ts.isHit = false;
                        ts.isCrit = false;
                        effect.proc = true;
                        return [];
                    }
                }
            }
        }
        return [];
    }
    procSuperBlock(ts) {
        if (ts.isAttack && ts.isHit && ts.hp > 0) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                if (effect.name == "superblock") {
                    ts.hp = Math.floor(ts.damage * (1-effect.resist));
                    effect.proc = true;
                    return [];
                }
            }
        }
        return [];
    }
    procBlock(ts) {
        if (ts.isAttack && ts.isHit && ts.hp > 0) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                if (effect.name == "block") {
                    ts.hp = Math.floor(ts.damage * (1-effect.resist));
                    effect.proc = true;
                    return [];
                }
            }
        }
        return [];
    }
    procExposed(ts) {
        if (ts.isAttack && ts.isHit && ts.hp > 0) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                if (effect.name == "exposed") {
                    ts.hp += 1;
                    effect.proc = true;
                }
            }
        }
        return [];
    }
    takeDamage(n) {
        if (n > 0) {
            this.hp = Math.max(this.hp-n, 0);
            return ["-" + n + " HP"];
        } else {
            return [];
        }
    }
    heal(n) {
        if (n > 0) {
            this.hp = Math.min(this.hp+n, this.maxHp);
            return ["+" + n + " HP"];
        } else {
            return [];
        }
    }
    gainStress(n) {
        return [];
    }
    loseStress(n) {
        return [];
    }
    onTakeDamage(ts) {
        return [];
    }
    onHealed(ts) {
        return [];
    }
    onHealing(ts) {
        return [];
    }
    onStressGain(ts) {
        return [];
    }
    onStressLost(ts) {
        return [];
    }
    onDodgeAttack(ts) {
        return [];
    }
    onCrit() {
        return [];
    }
    onMiss() {
        return [];
    }
    onGiveBuffs(buffs) {
        return [];
    }
    onGainEffect(ts) {
        return [];
    }
    onRemoveEffect(ts) {
        return [];
    }
    onCombatStart() {
        return;
    }
    lootBonus() {
        return false;
    }
    handleEffects(ts) {
        var tss = [ts];
        tss = tss.concat(this.procSuperDodge(ts));
        tss = tss.concat(this.procDodge(ts));
        tss = tss.concat(this.procSuperBlock(ts));
        tss = tss.concat(this.procBlock(ts));
        tss = tss.concat(this.procExposed(ts));
        return tss;
    }
    updateEffects(effectsGained, effectsLost) {
        // Just proc lost effects without anything happening
        for (var i = 0; i < effectsLost.length; i++) {
            for (var j = 0; j < this.effects.length; j++) {
                var effect = this.effects[j];
                if (effect.name == effectsLost[i]) {
                    effect.proc = true;
                }
            }
        }
        var texts = [];
        for (var i = 0; i < effectsGained.length; i++) {
            var effect = effectsGained[i];
            if (effect.name != "stunned" || !this.effects.some((e) => e.name == "dazed")) {
              this.effects.push(effect);
              texts.push(effect.display);
            }
        }
        if (effectsLost.length > 0) {
            texts.push("Cleared debuffs!");
        }
        return texts;
    }
    handleProtect(ts) {
        if (ts.isHit) {
            if (ts.isAttack) {
                for (var i = 0; i < this.effects.length; i++) {
                    var effect = this.effects[i];
                    if (effect.name == "protectedby") {
                        effect.proc = true;
                        effect.srcEffect.proc = true;
                        ts.target = effect.protector;
                        var ts_new = new TargetSummary(this, false, false, true, 0, 0, [], [], 0);
                        ts_new.texts = ["Protected!"];
                        return {proc : true, tss : ts.target.checkTargetSummary(ts).concat([ts_new])};
                    }
                }
            }
        }
        return {proc : false};
    }
    removeExistingProtections() {
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if (effect.name == "protectedby") {
                effect.proc = true;
                effect.srcEffect.proc = true;
            }
        }
    }
    // Returns an object {doSkip : Boolean, tss : [TargetSummary]}
    onTurnStart() {
        var doSkip = false;
        var tss = [];
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
            }
        }
        if (!doSkip) {
            for (var i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];
                switch (effect.name) {
                    case ("rage"):
                        var rageProc = !this.procs(75);
                        if (rageProc) {
                            doSkip = true;
                            effect.proc = true;
                            var ts = new TargetSummary(this, true, true, false, 0, 1, [], [], 0)
                            ts.texts.push("Raging!");
                            tss.push(ts);
                        }
                        break;
                }
            }
        }
        return {doSkip : doSkip, tss : tss};
    }
    checkTargetSummary(ts) {
        // Don't protect if stunned
        var doSkip = false;
        for (var i = 0; i < this.effects.length; i++) {
            var effect = this.effects[i];
            if ((effect.name == "stunned" && effect.proc)
                && (effect.name == "rage" && effect.proc)) {
                doSkip = true;
                break;
            }
        }
        if (!doSkip) {
            var protect = this.handleProtect(ts);
            if (protect.proc) {
                return protect.tss;
            }
        }
        var tss = this.handleEffects(ts);
        // Not protected from hit
        if (!ts.isHit && ts.isAttack) {
            tss = tss.concat(this.onDodgeAttack(ts));
        } else if (ts.isHit) {
            if (ts.isAttack) {
                if (ts.hp > 0) {
                    tss = tss.concat(this.onTakeDamage(ts));
                }
                if (ts.stress > 0) {
                    tss = tss.concat(this.onStressGain(ts))
                }
            } else {
                if (ts.hp > 0) {
                    tss = tss.concat(this.onHealed(ts));
                }
                if (ts.stress > 0) {
                    tss = tss.concat(this.onStressLost(ts))
                }
            }
        }
        tss = tss.concat(this.onGainEffect(ts));
        return tss
    }
    clearProcs() {
        this.effects = this.effects.filter((e) => !e.proc);
    }
    applyTargetSummary(ts) {
        var texts = ts.texts;
        if (ts.isHit) {
            if (ts.isAttack) {
                if (ts.isCrit) {
                    texts.push("Crit!");
                }
                texts = texts.concat(this.takeDamage(ts.hp));
                texts = texts.concat(this.gainStress(ts.stress));
            } else {
                texts = texts.concat(this.heal(ts.hp));
                texts = texts.concat(this.loseStress(ts.stress));
            }
            texts = texts.concat(this.updateEffects(ts.effectsGained, ts.effectsLost));
            if (ts.movement < 0 || (ts.movement > 0 && !this.isClient)) {
                texts.push("Moved [" + Math.abs(ts.movement) + " >>]")
            } else if (ts.movement > 0 || (ts.movement < 0 && !this.isClient)) {
                texts.push("Moved [<< " + Math.abs(ts.movement) + "]")
            }
        } else {
            if (!ts.isCrit) {
                texts.push("Miss!");
            }
        }
        this.clearProcs();
        return texts
    }
};

export class Corpse extends Character {
    anim_idle     = "img:corpse";
    anim_ability1 = "img:corpse";
    anim_defend   = "img:corpse";
    constructor(game, rank) {
        super(game, "Corpse", 1, false, rank);
        this.abilities = [];
    }
    chooseAct(allies, enemies) {
        return this.abilities[0].cast(enemies);
    }
    isDead() {
        return true;
    }
}