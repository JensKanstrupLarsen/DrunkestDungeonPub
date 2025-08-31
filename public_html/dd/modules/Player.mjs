export class Player {
    name = "unknown";
    socket = -1;
    active = false;
    class = 0;
    constructor(playerName, socket) {
        this.name = playerName;
        this.socket = socket;
        this.active = true;
    }
    get name() {
        return this.name;
    }
    set name(x) {
        this.name = x;
    }
    get socket() {
        return this.socket;
    }
    set socket(x) {
        this.socket = x;
    }
    get active() {
        return this.active;
    }
    set active(x) {
        this.active = x;
    }
    get class() {
        return this.class;
    }
    set class(x) {
        this.class = x;
    }
    query_useAbility() {

    }
};