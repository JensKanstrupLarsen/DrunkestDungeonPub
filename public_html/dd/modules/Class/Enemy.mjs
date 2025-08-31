import { Character } from "./Character.mjs";
import { CultistBrawlerAbility1, CultistWitchAbility1, SkeletonSoldierAbility1, SkeletonNobleAbility1, SkeletonDefenderAbility1, SkeletonCaptainAbility1, RedSpiderAbility1, GreenSpiderAbility1, GhoulAbility1, GhoulAbility2, GargoyleAbility1, GargoyleAbility2, ShamblerAbility1, ShamblerAbility2, ShamblerAbility3, CollectorAbility1, CollectorAbility2, NecromancerAbility1, NecromancerAbility2, NecromancerAbility3, ShamblerSpawnAbility1, ShamblerSpawnAbility2 } from "../Ability/EnemyAbility.mjs";
import { getRandomInt, rollDice } from "../DiceRoll.mjs";

export function getRandomEncounter(game) {
    var partyLevel = 0;
    for (var i = 0; i < game.players.length; i++) {
        partyLevel += game.players[i].level;
    }
    switch (rollDice(4) + partyLevel - 4) {
        case 1:
            return [
                new SkeletonSoldier(game, 1),
                new SkeletonSoldier(game, 2),
                new SkeletonNoble(game, 3)
            ]
        case 2:
            return [
                new CultistBrawler(game, 1),
                new CultistBrawler(game, 2),
                new CultistWitch(game, 3)
            ];
        case 3:
            return [
                new SkeletonDefender(game, 1),
                new SkeletonSoldier(game, 2),
                new SkeletonSoldier(game, 3),
                new SkeletonNoble(game, 4)
            ];
        case 4:
            return [
                new Ghoul(game, 1),
                new CultistBrawler(game, 2),
                new CultistWitch(game, 3)
            ];
        case 5:
            return [
                new RedSpider(game, 1),
                new RedSpider(game, 2),
                new GreenSpider(game, 3),
                new GreenSpider(game, 4)
            ];
        case 6:
            return [
                new SkeletonCaptain(game, 1),
                new SkeletonSoldier(game, 2),
                new SkeletonNoble(game, 3),
                new SkeletonNoble(game, 4)
            ];
        case 7:
            return [
                new Gargoyle(game, 1),
                new SkeletonDefender(game, 2),
                new SkeletonSoldier(game, 3),
                new SkeletonNoble(game, 4)
            ];
        case 8:
            return [
                new Ghoul(game, 1),
                new Ghoul(game, 2),
                new CultistWitch(game, 3),
                new CultistWitch(game, 4)
            ];
    }
}

export class EnemyCharacter extends Character {
    chooseAct(allies, enemies) {
        return this.abilities[getRandomInt(this.abilities.length)].cast(enemies);
    }
}

export class CultistBrawler extends EnemyCharacter {
    anim_idle     = "img:cultistbrawler_idle";
    anim_ability1 = "img:cultistbrawler_ability1";
    anim_defend   = "img:cultistbrawler_defend";
    constructor(game, rank) {
        super(game, "Cultist Brawler", 4, false, rank);
        this.abilities = [new CultistBrawlerAbility1(this)];
    }
}

export class CultistWitch extends EnemyCharacter {
    anim_idle     = "img:cultistwitch_idle";
    anim_ability1 = "img:cultistwitch_ability1";
    anim_defend   = "img:cultistwitch_defend";
    constructor(game, rank) {
        super(game, "Cultist Witch", 3, false, rank);
        this.abilities = [new CultistWitchAbility1(this)];
    }
}

export class SkeletonSoldier extends EnemyCharacter {
    anim_idle     = "img:skeletonsoldier_idle";
    anim_ability1 = "img:skeletonsoldier_ability1";
    anim_defend   = "img:skeletonsoldier_defend";
    constructor(game, rank) {
        super(game, "Skeleton Soldier", 3, false, rank);
        this.abilities = [new SkeletonSoldierAbility1(this)];
    }
}

export class SkeletonNoble extends EnemyCharacter {
    anim_idle     = "img:skeletonnoble_idle";
    anim_ability1 = "img:skeletonnoble_ability1";
    anim_defend   = "img:skeletonnoble_defend";
    constructor(game, rank) {
        super(game, "Skeleton Noble", 2, false, rank);
        this.abilities = [new SkeletonNobleAbility1(this)];
    }
}

export class SkeletonDefender extends EnemyCharacter {
    anim_idle     = "img:skeletondefender_idle";
    anim_ability1 = "img:skeletondefender_ability1";
    anim_defend   = "img:skeletondefender_defend";
    constructor(game, rank) {
        super(game, "Skeleton Defender", 6, false, rank);
        this.abilities = [new SkeletonDefenderAbility1(this)];
    }
}

export class SkeletonCaptain extends EnemyCharacter {
    anim_idle     = "img:skeletoncaptain_idle";
    anim_ability1 = "img:skeletoncaptain_ability1";
    anim_defend   = "img:skeletoncaptain_defend";
    constructor(game, rank) {
        super(game, "Skeleton Captain", 6, false, rank);
        this.abilities = [new SkeletonCaptainAbility1(this)];
    }
}

export class RedSpider extends EnemyCharacter {
    anim_idle     = "img:redspider_idle";
    anim_ability1 = "img:redspider_ability1";
    anim_defend   = "img:redspider_defend";
    constructor(game, rank) {
        super(game, "Red Spider", 4, false, rank);
        this.abilities = [new RedSpiderAbility1(this)];
    }
}

export class GreenSpider extends EnemyCharacter {
    anim_idle     = "img:greenspider_idle";
    anim_ability1 = "img:greenspider_ability1";
    anim_defend   = "img:greenspider_defend";
    constructor(game, rank) {
        super(game, "Green Spider", 4, false, rank);
        this.abilities = [new GreenSpiderAbility1(this)];
    }
}

export class Ghoul extends EnemyCharacter {
    anim_idle     = "img:ghoul_idle";
    anim_ability1 = "img:ghoul_ability1";
    anim_ability2 = "img:ghoul_ability2";
    anim_defend   = "img:ghoul_defend";
    constructor(game, rank) {
        super(game, "Ghoul", 8, false, rank);
        this.abilities = [
            new GhoulAbility1(this),
            new GhoulAbility2(this)
        ];
    }
}

export class Gargoyle extends EnemyCharacter {
    anim_idle     = "img:gargoyle_idle";
    anim_ability1 = "img:gargoyle_ability1";
    anim_ability2 = "img:gargoyle_ability2";
    anim_defend   = "img:gargoyle_defend";
    constructor(game, rank) {
        super(game, "Gargoyle", 8, false, rank);
        this.abilities = [
            new GargoyleAbility1(this),
            new GargoyleAbility2(this)
        ];
    }
}

export class Shambler extends EnemyCharacter {
    anim_idle     = "img:shambler_idle";
    anim_ability1 = "img:shambler_ability1";
    anim_ability2 = "img:shambler_ability2";
    anim_ability3 = "img:shambler_ability3";
    anim_defend   = "img:shambler_defend";
    first_turn = true;
    constructor(game, rank) {
        super(game, "The Shambler", 15, false, rank);
        this.first_turn = true;
        this.abilities = [
            new ShamblerAbility1(this),
            new ShamblerAbility2(this),
            new ShamblerAbility3(this)
        ];
    }
    chooseAct(allies, enemies) {
        if (this.first_turn) {
            this.first_turn = false;
            return this.abilities[0].cast(enemies);
        } else {
            return this.abilities[getRandomInt(this.abilities.length-1)+1].cast(enemies);
        }
    }
}

export class ShamblerSpawn extends EnemyCharacter {
    anim_idle     = "img:shamblerspawn_idle";
    anim_ability1 = "img:shamblerspawn_ability1";
    anim_ability2 = "img:shamblerspawn_ability2";
    anim_defend   = "img:shamblerspawn_defend";
    constructor(game, rank) {
        super(game, "Shambler Spawn", 3, false, rank);
        this.first_turn = true;
        this.abilities = [
            new ShamblerSpawnAbility1(this),
            new ShamblerSpawnAbility2(this)
        ];
    }
    chooseAct(allies, enemies) {
        if (this.first_turn) {
            this.first_turn = false;
            return this.abilities[0].cast(allies, enemies);
        } else {
            return this.abilities[getRandomInt(this.abilities.length)].cast(allies, enemies);
        }
       
    }
}

export class Collector extends EnemyCharacter {
    anim_idle     = "img:collector_idle";
    anim_ability1 = "img:collector_ability1";
    anim_ability2 = "img:collector_ability2";
    anim_defend   = "img:collector_defend";
    constructor(game, rank) {
        super(game, "The Collector", 15, false, rank);
        this.abilities = [
            new CollectorAbility1(this),
            new CollectorAbility2(this)
        ];
    }
    chooseAct(allies, enemies) {
        if (this.hp < 10) {
            if (rollDice(2) == 1) {
                return this.abilities[1].cast(allies);
            } else {
                return this.abilities[0].cast(enemies);
            }
        } else {
            return this.abilities[0].cast(enemies);
        }
    }
}

export class Necromancer extends EnemyCharacter {
    anim_idle     = "img:necromancer_idle";
    anim_ability1 = "img:necromancer_ability1";
    anim_ability2 = "img:necromancer_ability2";
    anim_ability3 = "img:necromancer_ability3";
    anim_defend   = "img:necromancer_defend";
    constructor(game, rank) {
        super(game, "The Necromancer", 30, false, rank);
        this.abilities = [
            new NecromancerAbility1(this),
            new NecromancerAbility2(this),
            new NecromancerAbility3(this)
        ];
    }
    chooseAct(allies, enemies) {
        if (allies.length < 4) {
            if (rollDice(2) == 1) {
                return this.abilities[0].cast(enemies);
            } else {
                var target = this.abilities[1].choosePlayerTarget(enemies);
                if (target.hp == 0) {
                    return this.abilities[1].cast(target);
                } else {
                    return this.abilities[2].cast(target);
                }
            }
        } else {
            var target = this.abilities[1].choosePlayerTarget(enemies);
            if (target.hp == 0) {
                return this.abilities[1].cast(target);
            } else {
                return this.abilities[2].cast(target);
            }
        }
    }
}