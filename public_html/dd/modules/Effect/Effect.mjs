export class Effect {
    name = "";
    display = "";
    owner = undefined;
    static s_icon = undefined;
    icon = undefined;
    proc = false;
    isDebuff = false;
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.icon = this.constructor.s_icon;
    }
    getIcon() {
        return this.icon;
    }
    serialize() {
        return {name : this.name, icon : this.icon};
    }
};

// Triggers when casting ability:
export class Crit extends Effect {
    static s_icon = "img:crit";
    bonus = 1;
    constructor(owner) {
        super("crit", owner);
        this.display = "Gained [Crit]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class SuperCrit extends Crit {
    static s_icon = "img:supercrit";
    bonus = 2;
    constructor(owner) {
        super(owner);
        this.name = "supercrit";
        this.display = "Gained [Crit++]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Blind extends Effect {
    static s_icon =  "img:blind";
    chance = 0.5;
    isDebuff = true;
    constructor(owner) {
        super("blind", owner);
        this.display = "Gained [Blind]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Crescendo extends Effect {
    static s_icon = "img:crescendo";
    constructor(owner) {
        super("crescendo", owner);
        this.display = "Gained [Finale]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Immobilized extends Effect {
    static s_icon = "img:immobilized";
    isDebuff = true;
    constructor(owner) {
        super("immobilized", owner);
        this.display = "Immobilized";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}

// Passively does something
export class Stunned extends Effect {
    static s_icon =  "img:stunned";
    isDebuff = true;
    constructor(owner) {
        super("stunned", owner);
        this.display = "Gained [Stun]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Dazed extends Effect {
    static s_icon = "img:dazed";
    constructor(owner) {
        super("dazed", owner);
        this.display = "";//"Stun wearing off...";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Protecting extends Effect {
    static s_icon = "img:protecting";
    protecting = undefined;
    constructor(owner, protecting) {
        super("protecting", owner);
        this.display = "Protecting " + protecting.name;
        this.protecting = protecting;
    }
    serialize() {
        return {name : this.name, protecting : this.protecting.name, icon : this.icon};
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Foresight extends Effect {
    static s_icon = "img:foresight";
    constructor(owner) {
        super("foresight", owner);
        this.display = "Gained [Future Sight]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Rage extends Effect {
    static s_icon = "img:rage";
    isDebuff = true;
    constructor(owner) {
        super("rage", owner);
        this.display = "Gained [Rage]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}

// Triggers when something happens to you
export class ProtectedBy extends Effect {
    static s_icon = "img:protectedby";
    protector = undefined;
    srcEffect = undefined;
    constructor(owner, protector, srcEffect) {
        super("protectedby", owner);
        this.protector = protector;
        this.srcEffect = srcEffect;
        this.display = "Gained [Protected]";
    }
    serialize() {
        return {name : this.name, protector : this.protector.name, icon : this.icon};
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Dodge extends Effect {
    static s_icon = "img:dodge";
    chance = 0.5;
    constructor(owner) {
        super("dodge", owner);
        this.display = "Gained [Dodge]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class SuperDodge extends Dodge {
    static s_icon = "img:superdodge";
    chance = 0.8;
    constructor(owner) {
        super(owner);
        this.name = "superdodge";
        this.display = "Gained [Dodge++]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Block extends Effect {
    static s_icon = "img:block";
    resist = 0.5;
    constructor(owner) {
        super("block", owner);
        this.display = "Gained [Block]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class SuperBlock extends Block {
    static s_icon = "img:superblock";
    resist = 1;
    constructor(owner) {
        super(owner);
        this.name = "superblock";
        this.display = "Gained [Block++]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
export class Exposed extends Effect {
    static s_icon = "img:exposed";
    isDebuff = true;
    constructor(owner) {
        super("exposed", owner);
        this.display = "Gained [Exposed]";
    }
    static getImage(size) {
        return "<img src='" + document.getElementById(this.s_icon).src + "' style='width:"+size+"px;height:"+size+"px'>";
    }
}
