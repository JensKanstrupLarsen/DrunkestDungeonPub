import { rollDice } from '../DiceRoll.mjs'

export class TargetSummary {
    target = undefined;
    isAttack = false; // If isAttack is false, heals the hp/stress values instead
    isHit = false;
    hp = 0;
    stress = 0;
    effectsGained = [];
    effectsLost = [];
    movement = 0;
    texts = [];
    constructor(target, isAttack, isHit, isCrit, hp, stress, effectsGained, effectsLost, movement) {
        this.target = target;
        this.isAttack = isAttack;
        this.isHit = isHit;
        this.isCrit = isCrit
        this.hp = hp;
        this.stress = stress;
        this.effectsGained = effectsGained;
        this.effectsLost = effectsLost;
        this.movement = movement
        this.texts = [];
    }
}

export class CombatSummary {
    text = "";
    caster = undefined;
    targetSummaries = [];
    abilityNum = 0;
    constructor(text, caster, targetSummaries, abilityNum) {
        this.text = text;
        this.caster = caster;
        this.targetSummaries = targetSummaries;
        this.abilityNum = abilityNum;
    }
}

export function createDummyTS(target) {
    return new TargetSummary(target, false, false, true, 0, 0, [], [], 0);
}

export class Ability {
    name = "";
    icon = undefined;
    owner = undefined;
    isAttack = false;
    usableRanks = [1,2,3,4];
    targetRanks = [];
    canTargetSelf = false;
    constructor(name, icon, owner, isAttack, usableRanks, targetRanks, canTargetSelf) {
        this.name = name;
        this.icon = icon;
        this.owner = owner;
        this.isAttack = isAttack;
        this.usableRanks = usableRanks;
        this.targetRanks = targetRanks;
        this.canTargetSelf = canTargetSelf;
        this.actHost = this.actHost.bind(this);
    }
    getTitle() {
        return "<span style='font-size:80px'>" + this.name + "</span><br>";
    }
    getRanks() {
        var targets = "";
        if (this.targetRanks.length == 0) { // No target
            targets = "No target";
        } else if (this.targetRanks[0] > 0) { // Allies
            targets = "Target ally: " + this.targetRanks.toString();
        } else { // Enemies
            targets = "Target enemy: " + this.targetRanks.map((t) => Math.abs(t));
        }
        return "<span style='font-size:40px'>Pos: " + this.usableRanks.toString() + " | " + targets + "</span><br>";
    }
    getDescription() {
        return "<p></p>";
    }
    getHTML() {
        return this.getTitle() + this.getRanks() + this.getDescription();
    }
    get isAttack() {
        return this.isAttack;
    }
    cast(targets) {
        return new CombatSummary("", this.owner, []);
    }
    actHost(allies, enemies) {
        if (this.targetRanks.length == 0) { // No target
            this.owner.game.runBattleAction(this.cast([allies, enemies]), false)
        } else if (this.targetRanks[0] > 0) { // Allies
            var validTargets = [];
            for (var i = 0; i < this.targetRanks.length; i++) {
                var rank = this.targetRanks[i];
                var target = allies[rank-1];
                if (target != this.owner || this.canTargetSelf) {
                    validTargets.push(target);
                }
            }
            this.singleTarget(validTargets.reverse(), (target) => {
                this.owner.game.runBattleAction(this.cast([target]), false);})
        } else { // Enemies
            var validTargets = [];
            for (var i = 0; i < this.targetRanks.length; i++) {
                var rank = Math.abs(this.targetRanks[i]);
                if (rank-1 < enemies.length) {
                    var target = enemies[rank-1];
                    validTargets.push(target);
                }
            }
            this.singleTarget(validTargets, (target) => {
                this.owner.game.runBattleAction(this.cast([target]), false);})
        }
    }
    actPlayer(allies, enemies, abilityNum) {
        console.log("huh2.5");
        if (this.targetRanks.length == 0) { // No target
            this.owner.game.sendAbilityUse(abilityNum, 0)
        } else if (this.targetRanks[0] > 0) { // Allies
            var validTargets = [];
            for (var i = 0; i < this.targetRanks.length; i++) {
                var rank = this.targetRanks[i];
                var target = allies[rank-1];
                if (target.name != this.owner.name || this.canTargetSelf) {
                    validTargets.push({rank : rank, target : target});
                }
            }
            ((a) => this.singleTargetPlayer(validTargets.reverse(), (target) => {
                this.owner.game.sendAbilityUse(abilityNum, target);}))(abilityNum);
        } else { // Enemies
            var validTargets = [];
            for (var i = 0; i < this.targetRanks.length; i++) {
                var rank = Math.abs(this.targetRanks[i]);
                if (rank-1 < enemies.length) {
                    var target = enemies[rank-1];
                    validTargets.push({rank : rank, target : target});
                }
            }
            ((a) => this.singleTargetPlayer(validTargets, (target) => {
                this.owner.game.sendAbilityUse(abilityNum, target);}))(abilityNum);
        }
    }
    singleTargetPlayer(targets, callback) {
        console.log("huh2.6");
        var imgs = []; var hps = []; var maxHps = []; var callbacks = [];
        for (var i = 0; i < targets.length; i++) {
            imgs.push(targets[i].target.img);
            hps.push(targets[i].target.hp.current);
            maxHps.push(targets[i].target.hp.max);
            callbacks.push(((target) => () => callback(target))(targets[i].rank));
        }
        this.owner.game.getTargetPopup(imgs, hps, maxHps, callbacks);
    }
    singleTarget(targets, callback) {
        var imgs = []; var hps = []; var maxHps = []; var callbacks = [];
        for (var i = 0; i < targets.length; i++) {
            imgs.push(targets[i].getAnimIdle());
            hps.push(targets[i].hp);
            maxHps.push(targets[i].maxHp);
            callbacks.push(((target) => () => callback(target))(targets[i]));
        }
        this.owner.game.getTargetPopup(imgs, hps, maxHps, callbacks);
    }
};

export class SwapPosition extends Ability {
    constructor(owner) {
        super("Swap", "img:icon_swap_ability", owner, false, [1,2,3,4], [1,2,3,4], false);
    }
    getDescription() {
        return "<span>Move to another rank.</span>"
    }
    cast(targets) {
        var target = targets[0];
        var ts = new TargetSummary(this.owner, false, true, false, 0, 0, [], [], target.rank - this.owner.rank);
        return new CombatSummary(
            this.name, this.owner, [ts], 0);
    }
}

export function HLose(text) {
    return "<span style='opacity:0.4'><mark style='background-color: #852929; color: #978754'><s>" + text + "</s></mark></span>"
}

export function HGain(text) {
    return "<mark style='background-color: #852929; color: #978754'>" + text + "</mark>"
}

export function HPower(text) {
    return "<mark style='background-color: #185519; color: #978754'>" + text + "</mark>"
}