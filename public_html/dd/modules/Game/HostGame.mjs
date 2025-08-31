import { getRandomInt, rollDice } from "../DiceRoll.mjs";
import { TargetSummary, CombatSummary } from "../Ability/Ability.mjs";
import { Corpse } from "../Class/Character.mjs";
import { Game } from "./Game.mjs";
import { Bookshelf, Fountain, Crate, AlchemyTable, WanderingTrader, Scrolls, HolyFountain, AgedBarrel, StoneChest, EldritchTrader, ShamblerAltar, EldritchAltar } from "../Curio/Curio.mjs";
import { EldritchMap, EldritchStatue, EldritchVial, getRandomEldritchItem, getRandomItem, HealingVial, HolyWater } from "../Item/Item.mjs";
import { Collector, getRandomEncounter, Necromancer, Shambler, ShamblerSpawn, SkeletonDefender, SkeletonNoble, SkeletonSoldier } from "../Class/Enemy.mjs";

export class HostGame extends Game {
    clients = [];
    dungeonLayout = [];
    corridorLayout = [];
    outerCorridors = [];
    dungeonFOW = [];
    corridorFOW = [];
    outerFOW = [];
    constructor(socket, roomID) {
        super(socket, roomID)
        this.audio = undefined;
        this.partyLocation = -1;
        this.inventory = [];
        this.nextRoom = -1;
        this.corridorLocation = -2;
        this.keysFound = 0;
        this.inRoom = true;
        this.inCorridor = false;
        this.canMove = false;
        this.currentCurio = undefined;
        this.curioInspected = false;
        this.playersResponded = 0;
        this.players = [];
        this.enemies = [];
		this.canAct = true;
        this.battleReward = undefined;
        this.lobbyScreen = document.getElementById("lobbyScreen");
        this.draftScreen = document.getElementById("draftScreen");
        this.gameScreen = document.getElementById("gameScreen");
        this.playerDisplay = document.getElementById("playerDisplay");
        this.roomCodeDisplay = document.getElementById("roomCodeDisplay");
        this.mapCanvas = document.getElementById("mapCanvas").getContext("2d");
        this.dungeonLayout = Array(Array(4),Array(4),Array(4),Array(4));
        this.outerRooms = Array(2);
        this.corridorLayout = Array(Array(3),Array(4),Array(3),Array(4),Array(3),Array(4),Array(3));
        this.outerCorridors = Array(Array(2),Array(2));
        this.dungeonFOW = Array(Array(4),Array(4),Array(4),Array(4));
        this.corridorFOW = Array(
            Array(false,false,false),
            Array(false,false,false,false),
            Array(false,false,false),
            Array(false,false,false,false),
            Array(false,false,false),
            Array(false,false,false,false),
            Array(false,false,false),);
        this.outerFOW = Array(Array(false, false), Array(false, false));
        this.turnOrder = [];
        this.currentChar = undefined;
        this.bg = document.getElementById("img:backgroundFloor1");
        this.imgEntrance = document.getElementById("img:room_entrance");
        this.imgBossRoom = document.getElementById("img:room_boss");
        this.imgHiddenRoom = document.getElementById("img:room_unknown");
        this.imgMapIndicator = document.getElementById("img:map_indicator");
        this.imgsRoom = Array(
            document.getElementById("img:room_empty"),
            document.getElementById("img:room_battle"),
            document.getElementById("img:room_treasure"),
            document.getElementById("img:room_altar"),
            document.getElementById("img:room_key"));
        this.imgHiddenCorridor = document.getElementById("img:corridor_unknown");
        this.imgsCorridor = Array(
            document.getElementById("img:corridor_empty"),
            document.getElementById("img:corridor_trap"),
            document.getElementById("img:corridor_battle"),
            document.getElementById("img:corridor_curio"),
            document.getElementById("img:corridor_special"));
        this.corridorEncounter = this.corridorEncounter.bind(this);
        this.roomEncounter = this.roomEncounter.bind(this);
        this.sendPlayerStatusUpdate = this.sendPlayerStatusUpdate.bind(this);
		this.drawVictory = this.drawVictory.bind(this);
    }
    startGame() {
        this.lobbyScreen.style.display = "none";
        this.draftScreen.style.display = "none";
        this.gameScreen.style.display = "block";
        document.getElementById("mapCanvas").style.display = "block";
        this.inRoom = true;
        this.inCorridor = false;
        this.inCombat = false;
        this.canMove = true;
        this.drawDungeon();
        this.generateDungeon();
    }
    playAudio(name) {
        if (this.audio != undefined) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this.audio = document.getElementById(name);
        this.audio.play();
    }
    updatePlayerDisplay() {
        this.playerDisplay.innerHTML = "Players:<br>";
        for (var i = 0; i < this.clients.length; i++) {
            this.playerDisplay.innerHTML += this.clients[i].name + "<br>";
        }
    }
    generateDungeon() {
        // 1 : Battle, 2 : Treasure, 3 : Altar, 4 : Key
        var allRooms = Array(1,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4);
        var dungeonRooms = Array()
        while (allRooms.length > 0) {
            var i = getRandomInt(allRooms.length);
            var r = allRooms.splice(i,1)
            dungeonRooms = dungeonRooms.concat(r)
        }
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                this.dungeonLayout[y][x] = dungeonRooms[y*4+x];
                this.dungeonFOW[y][x] = false;
            }
        }
        for (var y = 0; y < 7; y++) {
            for (var x = 0; (x < 3) || (x < 4 && y % 2 != 0); x++) {
                switch (rollDice(6)) {
                    case 1:
                        this.corridorLayout[y][x] = 1;
                        break;
                    case 2:
                    case 3:
                        this.corridorLayout[y][x] = 2;
                        break;
                    case 4:
                    case 5:
                        this.corridorLayout[y][x] = 3;
                        break;
                    case 6:
                        this.corridorLayout[y][x] = 4;
                        break;
                }
            }
        }
        for (var y = 0; y < 2; y++) {
            for (var x = 0; x < 2; x++) {
                switch (rollDice(6)) {
                    case 1:
                        this.outerCorridors[y][x] = 1;
                        break;
                    case 2:
                    case 3:
                        this.outerCorridors[y][x] = 2;
                        break;
                    case 4:
                    case 5:
                        this.outerCorridors[y][x] = 3;
                        break;
                    case 6:
                        this.outerCorridors[y][x] = 4;
                        break;
                }
            }
        }
    }
    getAdjacentRooms(location) {
        var adjacentRooms = [];
        var adjacentCorridors = [];
        var dirs = []
        if (location == -1) {
            adjacentRooms = [4, 8];
            adjacentCorridors = [-2, -1];
            dirs = ["up", "down"];
        } else if (location < 16) {
            if (location % 4 >= 1) { // Can go left
                adjacentRooms.push(location-1);
                adjacentCorridors.push(Math.floor(location / 4) * 7 + (location % 4) - 1)
                dirs.push("left");
            } else { // On left side
                if (location == 4 || location == 8) {
                    adjacentRooms.push(-1);
                    adjacentCorridors.push(location == 4 ? -2 : -1);
                    dirs.push("left");
                }
            }
            if (location % 4 <= 2) { // Can go right
                adjacentRooms.push(location+1);
                adjacentCorridors.push(Math.floor(location / 4) * 7 + (location % 4))
                dirs.push("right");
            } else { // On right side
                if (location == 7 || location == 11) {
                    if (this.keysFound == 3) {
                        adjacentRooms.push(16);
                        adjacentCorridors.push(location == 7 ? 24 : 25);
                        dirs.push("right");
                    }
                }
            }
            if (location - 4 >= 0) { // Can go up
                adjacentRooms.push(location-4);
                adjacentCorridors.push(Math.floor(location / 4) * 7 + (location % 4) - 4);
                dirs.push("up");
            }
            if (location + 4 <= 15) { // Can go down
                adjacentRooms.push(location+4);
                adjacentCorridors.push(Math.floor(location / 4) * 7 + (location % 4) + 3);
                dirs.push("down");
            }
        } else if (location == 16) {
            adjacentRooms = [7, 11];
            adjacentCorridors = [24, 25]
            dirs = ["up", "down"];
        }
        return {rooms: adjacentRooms, corridors : adjacentCorridors, dirs : dirs};
    }
    getCorridorXY(corridorNumber) {
        switch (corridorNumber) {
            case -2:
                return { y : 0, x : 0, outer : true};
            case -1:
                return { y : 1, x : 0, outer : true};
            case 24:
                return { y : 0, x : 1, outer : true};
            case 25:
                return { y : 1, x : 1, outer : true};
            default:
                var section = Math.floor(corridorNumber / 7);
                if (corridorNumber % 7 < 3) { // Sideways
                    return { y : section*2, x : corridorNumber % 7, outer : false};
                } else { // Topdown
                    return { y : section*2+1, x : (corridorNumber % 7) - 3, outer : false};
                }
        }
    }
    revealDungeon(rooms, corridors) {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i] >= 0 && rooms[i] <= 15) {
                var x = rooms[i] % 4;
                var y = Math.floor(rooms[i] / 4);
                console.log(x);
                console.log(y);
                this.dungeonFOW[y][x] = true;
            }
        }
        for (var i = 0; i < corridors.length; i++) {
            var coords = this.getCorridorXY(corridors[i]);
            if (coords.outer) {
                this.outerFOW[coords.y][coords.x] = true;
            } else {
                this.corridorFOW[coords.y][coords.x] = true;
            }
        }
    }
    drawEnterDungeon() {
        this.canMove = false;
        this.canAct = false;
        var alpha = 1;
        var animFadeoutInterval = setInterval(() => {
            this.drawDungeon();
            this.mapCanvas.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            this.mapCanvas.fillRect(0, 0, 1200, 900);
            alpha -= 0.005;
        }, 25)
        setTimeout(() => {
            this.canMove = true;
          	this.canAct = true;
            clearInterval(animFadeoutInterval);
            this.sendPlayerStatusUpdate();
        }, 6000);
    }
    drawDungeon() {
        var adjacentRooms = this.getAdjacentRooms(this.partyLocation).rooms;
        this.mapCanvas.drawImage(this.bg,0,0,1200,900);
        if (adjacentRooms.includes(-1)) {
            this.mapCanvas.fillStyle = "#978754";
            this.mapCanvas.fillRect(15, 365, 170, 170);
        } else if (adjacentRooms.includes(16)) {
            this.mapCanvas.fillStyle = "#978754";
            this.mapCanvas.fillRect(1015, 365, 170, 170);
        }
        this.mapCanvas.drawImage(this.imgEntrance,25,375,150,150);
        this.mapCanvas.drawImage(this.imgBossRoom,1025,375,150,150);
        if (this.partyLocation == -1) {
            this.mapCanvas.drawImage(this.imgMapIndicator,25,375,150,150);
        } else if (this.partyLocation == 16) {
            this.mapCanvas.drawImage(this.imgMapIndicator,1025,375,150,150);
        }

        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                var xPos = 225 + x * 200;
                var yPos = 75 + y * 200;
                if (adjacentRooms.includes(y * 4 + x)) {
                    this.mapCanvas.fillStyle = "#978754";
                    this.mapCanvas.fillRect(xPos-10, yPos-10, 170, 170);
                }
                if (this.dungeonFOW[y][x]) {
                    this.mapCanvas.drawImage(this.imgsRoom[this.dungeonLayout[y][x]], xPos, yPos, 150, 150);
                } else {
                    this.mapCanvas.drawImage(this.imgHiddenRoom, xPos, yPos, 150, 150);
                }
                if (this.partyLocation == y * 4 + x) {
                    this.mapCanvas.drawImage(this.imgMapIndicator, xPos, yPos, 150, 150);
                }
            }
        }
        for (var y = 0; y < 7; y++) {
            for (var x = 0; (x < 3) || (x < 4 && y % 2 != 0); x++) {
                var corridorImage = undefined;
                if (this.corridorFOW[y][x]) {
                    corridorImage = this.imgsCorridor[this.corridorLayout[y][x]];
                } else {
                    corridorImage = this.imgHiddenCorridor;
                }
                if (y % 2 != 0) {
                    var xPos = 275 + x * 200;
                    var yPos = 225 + Math.floor((y-1)/2) * 200;
                    this.mapCanvas.drawImage(corridorImage, xPos, yPos, 50, 50);
                } else {
                    var xPos = 375 + x * 200;
                    var yPos = 125 + Math.floor(y/2) * 200;
                    this.mapCanvas.drawImage(corridorImage, xPos, yPos, 50, 50);
                }
            }
        }
        for (var y = 0; y < 2; y++) {
            for (var x = 0; x < 2; x++) {
                var corridorImage = undefined;
                if (this.outerFOW[y][x]) {
                    corridorImage = this.imgsCorridor[this.outerCorridors[y][x]];
                } else {
                    corridorImage = this.imgHiddenCorridor;
                }
                var xPos = 175 + x * 800;
                var yPos = 375 + y * 100;
                this.mapCanvas.drawImage(corridorImage, xPos, yPos, 50, 50);
            }
        }
    }
    onPlayerMoveRequest(playerName, dir) {
        var partyLeader = this.players[0];
        if (playerName == partyLeader.name && this.canMove) {
            if (this.inRoom) {
                var adjacentRooms = this.getAdjacentRooms(this.partyLocation);
                console.log(adjacentRooms);
                for (var i = 0; i < adjacentRooms.dirs.length; i++) {
                    if (dir == adjacentRooms.dirs[i]) {
                        this.nextRoom = adjacentRooms.rooms[i];
                        this.corridorLocation = adjacentRooms.corridors[i];
                        this.inRoom = false;
                        this.inCorridor = true;
                        this.canMove = false;
                        this.revealDungeon([], [this.corridorLocation]);
                        this.drawDungeon();
                        this.sendPlayerStatusUpdate();
                        setTimeout(this.corridorEncounter, 1500);
                    }
                }
            } else if (this.inCorridor && dir == "continue") {
                if (this.nextRoom != -1 && this.nextRoom != 16) {
                    this.revealDungeon([this.nextRoom],[])
                }
                this.drawDungeon();
                this.partyLocation = this.nextRoom;
                this.inCorridor = false;
                this.inRoom = true;
                this.canMove = false;
                this.sendPlayerStatusUpdate();
                setTimeout(this.roomEncounter, 1500);
            }
        }
    }
    getPlayerByName(name) {
        return this.players.find((p) => p.name == name);
    }
    corridorEncounter() {
        var coords = this.getCorridorXY(this.corridorLocation);
        var encounterType = 0;
        if (coords.outer) {
            encounterType = this.outerCorridors[coords.y][coords.x];
            this.outerCorridors[coords.y][coords.x] = 0;
        } else {
            encounterType = this.corridorLayout[coords.y][coords.x];
            this.corridorLayout[coords.y][coords.x] = 0;
        }
        switch (encounterType) {
            case 1:
                this.canMove = false;
                var player = this.players[getRandomInt(this.players.length)];
                var texts = player.applyTargetSummary(
                    new TargetSummary(player, true, true, false, 1, 1, [], [], 0)
                );
                this.displayDungeonEvent("Trapped!", player.getAnimAbility(-1), [], [texts]);
                this.sendPlayerStatusUpdate();
                setTimeout(() => {
                    this.canMove = true;
                    this.drawDungeon();
                    this.sendPlayerStatusUpdate();
                }, 2600);
                break;
            case 2:
                // Roll for enemies
                this.enemies = getRandomEncounter(this);
                // Roll for loot
                var loot = [getRandomItem(this)];
                for (var i = 0; i < this.players.length; i++) {
                    if (this.players[i].lootBonus()) {
                        loot.push(getRandomItem(this));
                    }
                }
                this.battleReward = {battleType : "normal", loot : loot};
                this.canMove = false;
                this.inCombat = true;
                this.sendPlayerStatusUpdate();
                this.fadeTransition(true);
                setTimeout(() => {this.playAudio("music:combat")}, 1500);
                setTimeout(() => {this.startBattle()}, 3000)
                break;
            case 3:
                switch (rollDice(6)) {
                    case 1:
                        this.currentCurio = new Crate(this);
                        break;
                    case 2:
                        this.currentCurio = new Fountain(this);
                        break;
                    case 3:
                        this.currentCurio = new Bookshelf(this);
                        break;
                    case 4:
                        this.currentCurio = new AlchemyTable(this);
                        break;
                    case 5:
                        this.currentCurio = new WanderingTrader(this);
                        break;
                    case 6:
                        this.currentCurio = new Scrolls(this);
                        break;
                }
                this.getPlayerCurioResponse();
                break;
            case 4:
                switch (rollDice(6)) {
                    case 1:
                        this.newLocalPopup(
                            {
                                header : "The Collector",
                                image : "images/curios/collector_battle.png",
                                desc : "A ghastly figure approaches..."
                            },
                            [],[],false
                        )
          				setTimeout(() => {
          					this.clearPopup();
          					// Roll for enemies
                            this.enemies = [
                                new SkeletonSoldier(this, 1),
                                new SkeletonSoldier(this, 2),
                                new SkeletonSoldier(this, 3),
                                new Collector(this, 4)
                            ];
                            // Roll for loot
                            var loot = [getRandomEldritchItem(this), getRandomEldritchItem(this)];
                            for (var i = 0; i < this.players.length; i++) {
                                if (this.players[i].lootBonus()) {
                                    loot.push(getRandomItem(this));
                                }
                            }
                            this.battleReward = {battleType : "normal", loot : loot};
                            this.inCombat = true;
                            this.canMove = false;
                            this.fadeTransition(true);
                            setTimeout(() => {this.playAudio("music:boss")}, 1500);
                            setTimeout(() => {this.startBattle()}, 3000)
          				}, 3000);
                        break;
                    case 2:
                        this.currentCurio = new StoneChest(this);
                        this.getPlayerCurioResponse();
                        break;
                    case 3:
                        this.currentCurio = new HolyFountain(this);
                        this.getPlayerCurioResponse();
                        break;
                    case 4:
                        this.currentCurio = new AgedBarrel(this);
                        this.getPlayerCurioResponse();
                        break;
                    case 5:
                        this.currentCurio = new EldritchTrader(this);
                        this.getPlayerCurioResponse();
                        break;
                    case 6:
                        this.currentCurio = new ShamblerAltar(this);
                        this.getPlayerCurioResponse();
                        break;
                }
                break;
            default:
                this.canMove = true;
                this.drawDungeon();
                this.sendPlayerStatusUpdate();
                break;
        }
    }
    roomEncounter() {
        if (this.partyLocation == -1) {
            this.canMove = true;
            this.sendPlayerStatusUpdate();
        } else if (this.partyLocation < 16) {
            var y = Math.floor(this.partyLocation / 4);
            var x = this.partyLocation % 4;
            var roomType = this.dungeonLayout[y][x];
            this.dungeonLayout[y][x] = 0;
            switch (roomType) {
                case 1: // Battle
                    // Roll for enemies
                    this.enemies = getRandomEncounter(this);
                    // Roll for loot
                    var loot = [getRandomItem(this)];
                    for (var i = 0; i < this.players.length; i++) {
                        if (this.players[i].lootBonus()) {
                            loot.push(getRandomItem(this));
                        }
                    }
                    this.battleReward = {battleType : "normal", loot : loot};
                    this.inCombat = true;
                    this.canMove = false;
                    this.fadeTransition(true);
                    setTimeout(() => {this.playAudio("music:combat")}, 1500);
                    setTimeout(() => {this.startBattle()}, 3000)
                    break;
                case 2: // Treasure
                    var loot = getRandomItem(this);
                    this.inventory.push(loot);
                    this.sendPlayerStatusUpdate();
                    this.clearPopup();
                    this.newLootPopup([loot]);
                    setTimeout(() => {
                        this.clearPopup();
                        this.canMove = true;
                        this.drawDungeon();
                        this.sendPlayerStatusUpdate();
                    }, 3000);
                    break;
                case 3: // Altar
                    this.currentCurio = new EldritchAltar(this);
                    this.getPlayerCurioResponse();
                    break;
                case 4: // Key
                    // Roll for enemies
                    this.enemies = getRandomEncounter(this);
                    this.battleReward = {battleType : "key", loot : []};
                    this.inCombat = true;
                    this.canMove = false;
                    this.fadeTransition(true);
                    setTimeout(() => {this.playAudio("music:combat")}, 1500);
                    setTimeout(() => {this.startBattle()}, 3000)
                    break;
                default:
                    this.canMove = true;
                    this.drawDungeon();
                    this.sendPlayerStatusUpdate();
                    break;
            }
        } else {
            this.enemies = [
                new SkeletonDefender(this, 1),
                new SkeletonSoldier(this, 2),
                new SkeletonNoble(this, 3),
                new Necromancer(this, 4)
            ]
            this.battleReward = {battleType : "boss", loot : []};
            this.inCombat = true;
            this.canMove = false;
            this.fadeTransition(true);
            setTimeout(() => {this.playAudio("music:boss")}, 1500);
            setTimeout(() => {this.startBattle()}, 3000)
        }
    }
    closePlayerPopup() {
        this.socket.emit("host_close_popup", this.roomID);
    }
    receivePlayerResponse(action, playerName) {
        if (action == "Inspect") {
            var player = this.getPlayerByName(playerName);
            var playerIsMinLevel = true;
            for (var i = 0; i < this.players.length; i++) {
                playerIsMinLevel = (playerIsMinLevel && player.level <= this.players[i].level);
            }
            if (!this.curioInspected && (!this.currentCurio.name == "Eldritch Altar" || playerIsMinLevel)) {
                this.curioInspected = true;
                this.clearPopup();
                this.closePlayerPopup();
                var cs = this.currentCurio.inspect(player);
                var texts = player.applyTargetSummary(cs.targetSummaries[0])
                this.displayDungeonEvent(cs.text, player.getAnimAbility(cs.abilityNum), [], [texts]);
                this.sendPlayerStatusUpdate();
                if (this.currentCurio.name == "Shambler's altar" && cs.abilityNum == -1) {
                    setTimeout(() => {
                        this.enemies = [
                            new Shambler(this, 1),
                            new ShamblerSpawn(this, 2),
                            new ShamblerSpawn(this, 3),
                            new ShamblerSpawn(this, 4)
                        ];
                        // Roll for loot
                        var loot = [new EldritchStatue(this)];
                        for (var i = 0; i < this.players.length; i++) {
                            if (this.players[i].lootBonus()) {
                                loot.push(getRandomItem(this));
                            }
                        }
                        this.battleReward = {battleType : "normal", loot : loot};
                        this.inCombat = true;
                        this.canMove = false;
                        this.fadeTransition(true);
                        setTimeout(() => {this.playAudio("music:boss")}, 1500);
                        setTimeout(() => {this.startBattle()}, 3000)
                    }, 2600);
                } else {
                    setTimeout(() => {
                        this.canMove = true;
                        this.playersResponded = 0;
                        this.drawDungeon();
                        this.sendPlayerStatusUpdate();
                    }, 2600);
                }
            }
        } else {
            this.playersResponded += 1;
            if (this.playersResponded == this.players.length) {
                this.curioInspected = true;
                this.modal.style.display = "none";
                this.canMove = true;
                this.playersResponded = 0;
                this.drawDungeon();
                this.sendPlayerStatusUpdate();
            }
        }
    }
    getPlayerCurioResponse() {
        this.curioInspected = false;
        this.playersResponded = 0;
        var curio = this.currentCurio;
        this.newLocalPopup({header : curio.name, image : curio.image, desc : curio.desc}, [], [], false);
        this.getPlayerResponse({header : curio.name, image : curio.image, desc : curio.desc}, ["Inspect", "Leave"]);
    }

    sendPlayerStatusUpdate() {
        var movementStatus = {canMove : this.canMove, dirs : [], inCombat : this.inCombat};
        if (this.canMove) {
            if (this.inRoom) {
                movementStatus.dirs = this.getAdjacentRooms(this.partyLocation).dirs;
            } else if (this.inCorridor) {
                movementStatus.dirs = ["continue"];
            }
        }
        this.socket.emit("player_status_update",
            this.roomID,
            this.players.map((p) => ({
                name : p.name,
                img : p.getAnimIdle(),
                hp : {current : p.hp, max : p.maxHp},
                stress : {current : p.stress, max : p.maxStress},
                strength : p.strength,
                onDeathsDoor : p.onDeathsDoor,
                isHopeless : p.isHopeless,
                effects : p.effects.map((e) => e.serialize()),
                sips : p.sips
            })),
            this.enemies.map((e) => ({
                name : e.name,
                img : e.getAnimIdle(),
                hp : {current : e.hp, max : e.maxHp}
            })),
            movementStatus,
            this.inventory.map((i) => i.name)
        );
    }
    addKey() {
        var img = document.createElement('img');
        img.src = "images/mapicons/room_key.png";
        img.style.height = "150px";
        img.style.float = "center";
        document.getElementById("keysCollected").appendChild(img);
        this.keysFound += 1;
    }

    // ========
    // Movement
    // ========
    /*
    playerStatusUpdate:
        - All player positions, hp, stress, hopeless, effects
        
        - Inventory
    1. Send "movementPhase" to all players (enables item usage, pos swap and movement for pos 1)
    
    2. On item usage:
    3. On pos swap:
        - Player popup: choose target, send old pos new pos
        - Host:
            check old pos matches player,
            if so, move all
            then send playerStatusUpdate
    4. On movement:
        - Host: 
    */
    
    
    // ===========
    // Battle
    // ===========
    // battleState = True (or something)
    // Initially run updateBattleState()
    // updateBattleState()
    // -> Checks if battle is over - if not, moves to next character turn and call character.chooseAct()
    //    -> For players, sends socket msg to player, which sends back and calls runBattleAction()
    //    -> For enemies, call runBattleAction() directly
    // runBattleAction() 
    // -> "runs" and displays action (messaging relevant players) then calls updateBattleState()
    startBattle() {
        // Get new turn order
        if (this.turnOrder.length == 0) {
            var newTurnOrder = [];
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].onCombatStart();
                newTurnOrder.push(this.enemies[i]);
            }
            for (var i = 0; i < this.players.length; i++) {
                // TODO: maybe not hard code this???
                if (this.players[i].title == "Grave Robber" && !this.players[i].isHopeless) {
                    newTurnOrder.unshift(this.players[i]);
                } else {
                    newTurnOrder.push(this.players[i]);
                }
                this.players[i].onCombatStart();
            }
            this.turnOrder = newTurnOrder;
        }
        this.updateBattleState();
    }
    drawVictory() {
        this.playAudio("music:victory");
        var alpha = 0;
        var animFadeoutInterval = setInterval(() => {
            // this.drawBattle();
            this.mapCanvas.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
            this.mapCanvas.fillRect(0, 0, 1200, 900);
            this.mapCanvas.font = "200px ddfont";
            this.mapCanvas.fillStyle = "#000000";
            this.mapCanvas.textAlign = "center"
            this.mapCanvas.fillText("Victory", 600, 350);
            alpha += 0.005;
        }, 25)
        setTimeout(() => {
            clearInterval(animFadeoutInterval);
            var totalSips = 0;
            for (var i = 0; i < this.players.length; i++) {
                totalSips += this.players[i].sips;
            }
            this.mapCanvas.font = "100px ddfont";
            this.mapCanvas.fillStyle = "#000000";
            this.mapCanvas.textAlign = "center"
            this.mapCanvas.fillText("Total sips: " + totalSips, 600, 500);

        }, 6000);
    }
    drawDefeat() {
        this.playAudio("music:victory");
        var alpha = 0;
        var animFadeoutInterval = setInterval(() => {
            // this.drawBattle();
            this.mapCanvas.fillStyle = 'rgba(155, 0, 0, ' + alpha + ')';
            this.mapCanvas.fillRect(0, 0, 1200, 900);
            this.mapCanvas.font = "200px ddfont";
            this.mapCanvas.fillStyle = "#000000";
            this.mapCanvas.textAlign = "center"
            this.mapCanvas.fillText("Defeat", 600, 350);
            alpha += 0.005;
        }, 25)
        setTimeout(() => {
            clearInterval(animFadeoutInterval);
            var totalSips = 0;
            for (var i = 0; i < this.players.length; i++) {
                totalSips += this.players[i].sips;
            }
            this.mapCanvas.font = "100px ddfont";
            this.mapCanvas.fillStyle = "#000000";
            this.mapCanvas.textAlign = "center"
            this.mapCanvas.fillText("Total sips: " + totalSips, 600, 500);

        }, 6000);
    }
    allDead(chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!chars[i].isDead()) {
                return false;
            }
        }
        return true;
    }
    endBattle() {
        if (this.battleReward.battleType == "boss") {
            this.drawVictory();
            return;
        } else {
            setTimeout(() => {
                this.fadeTransition(false);
            }, 500);
            setTimeout(() => {this.playAudio("music:explore")}, 1500);
            setTimeout(() => {
                this.clearPopup();
                this.modal.style.display = "block";
                this.modalText.innerHTML = "Loot:";
                this.modalOptions.style.display = "block";
                switch (this.battleReward.battleType) {
                    case "normal":
                        this.inventory = this.inventory.concat(this.battleReward.loot);
                        this.newLootPopup(this.battleReward.loot);
                        break;
                    case "key":
                        this.newLocalPopup(
                            {
                                header : "Key found!",
                                image : "images/mapicons/room_key.png",
                                desc : ""
                            },
                            [], [], false
                        );
                        this.addKey();
                        break;
                    case "boss":
                        return;
                }
                for (var i = 0; i < this.players.length; i++) {
                    var player = this.players[i];
                    player.effects = [];
                }
                this.turnOrder = [];
                this.inCombat = false;
                this.canMove = true;
                this.sendPlayerStatusUpdate();
            }, 3100);
            setTimeout(() => {
                this.clearPopup();
                this.canMove = true;
                this.inCombat = false;
            }, 6000);
        }
    }
    updateBattleState() {
        if (this.allDead(this.players)) {
            // Game over
        } else if (this.allDead(this.enemies)) {
            this.drawBattle();
            this.endBattle();
        } else {
          	// Clear corpses
            this.enemies = this.enemies.filter((e) => !(e.name == "Corpse" && e.hp == 0));
            for (var i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].isDead()) {
                    this.enemies[i] = new Corpse(this, this.enemies[i].rank);
                }
            }

            // Removed effects that are proc'ed
            for (var i = 0; i < this.players.length; i++) {
                this.players[i].clearProcs();
            }
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].clearProcs();
            }
            this.sendPlayerStatusUpdate();

            // Get new turn order
            if (this.turnOrder.length == 0) {
                var newTurnOrder = [];
                for (var i = 0; i < this.enemies.length; i++) {
                    this.enemies[i].onCombatStart();
                    newTurnOrder.push(this.enemies[i]);
                }
                for (var i = 0; i < this.players.length; i++) {
                    // TODO: maybe not hard code this???
                    if (this.players[i].title == "Grave Robber" && !this.players[i].isHopeless) {
                        newTurnOrder.unshift(this.players[i]);
                    } else {
                        newTurnOrder.push(this.players[i]);
                    }
                    this.players[i].onCombatStart();
                }
                this.turnOrder = newTurnOrder;
            }
            // Get the current character
            this.currentChar = this.turnOrder[0];
            this.turnOrder = this.turnOrder.slice(1);

            this.drawBattle();
            this.mapCanvas.font = "100px ddfont";
            this.mapCanvas.fillStyle = "#978754";
            this.mapCanvas.textAlign = "center"
            this.mapCanvas.fillText(this.currentChar.name + "'s turn", 600, 200);
            var isEnemy = this.enemies.includes(this.currentChar);
            var turnStartStatus = this.currentChar.onTurnStart();
            if (turnStartStatus.doSkip) {
                this.canAct = false;
                setTimeout(() => {
                    this.runBattleAction(new CombatSummary("", this.currentChar, turnStartStatus.tss, -1), isEnemy)
                }, 1000);
            } else {
                if (!this.currentChar.isDead()) {
                    if (!isEnemy) {
              			this.canAct = true;
                        this.currentChar.chooseAct(this.players, this.enemies);
                    } else {
              			this.canAct = false;
                        setTimeout(() => {
                            var cs = this.currentChar.chooseAct(this.enemies, this.players);
                            this.runBattleAction(cs, true);
                        }, 1500);
                    }
                } else {
              		this.canAct = false;
                    this.updateBattleState()
                }
            }
        }
    }
    updatePositions(tss) {
        for (var i = 0; i < tss.length; i++) {
            if (tss[i].isHit) {
                var movement = tss[i].movement;
                var currentPos = this.players.findIndex((p) => p === tss[i].target);
                var party = this.players;
                if (currentPos == -1) { // It's an enemy
                    currentPos = this.enemies.findIndex((e) => e === tss[i].target);
                    party = this.enemies;
                }
                while (movement != 0) {
                    if (movement < 0) { // Move forward a rank
                        if (0 <= currentPos-1) {
                            var tmp = party[currentPos-1];
                            party[currentPos-1] = party[currentPos];
                            party[currentPos] = tmp;
                            party[currentPos-1].rank -= 1;
                            party[currentPos].rank += 1;
                            currentPos -= 1;
                        }
                        movement += 1;
                    } else if (movement > 0) { // Move back a rank
                        if (currentPos+1 < party.length) {
                            var tmp = party[currentPos+1];
                            party[currentPos+1] = party[currentPos];
                            party[currentPos] = tmp;
                            party[currentPos+1].rank += 1;
                            party[currentPos].rank -= 1;
                            currentPos += 1;
                        }
                        movement -= 1;
                    }
                }
            }
        }
    }
    runBattleAction(combatSummary, isEnemy) {
        var tss = [];
        for (var i = 0; i < combatSummary.targetSummaries.length; i++) {
            var ts = combatSummary.targetSummaries[i];
            tss = tss.concat(ts.target.checkTargetSummary(ts));
        }
        var casterImg = combatSummary.caster.getAnimAbility(combatSummary.abilityNum);
        var targets = [combatSummary.caster];
        for (var i = 0; i < tss.length; i++) {
            var ts = tss[i];
            if (!targets.includes(ts.target)) {
                targets.push(ts.target);
            }
        }
        var targetImgs = [undefined];
        var targetTexts = [];
        for (var i = 0; i < targets.length; i++) {
            var texts = [];
            var isAttack = false;
            for (var j = 0; j < tss.length; j++) {
                var ts = tss[j];
                if (ts.target === targets[i]) {
                    texts = texts.concat(targets[i].applyTargetSummary(ts));
                    if (ts.isAttack) {
                        isAttack = true;
                    }
                }
            }
            if (i > 0) { // Not the caster
                if (isAttack) {
                    targetImgs.push(targets[i].getAnimDefend());
                } else {
                    targetImgs.push(targets[i].getAnimIdle());
                }
            }
            targetTexts.push(texts);
        }
        this.updatePositions(combatSummary.targetSummaries);
        this.displayBattleAction(combatSummary.text, casterImg, targetImgs, targetTexts, isEnemy);
        setTimeout(() => {
            this.sendPlayerStatusUpdate();
            this.drawBattle();
            this.updateBattleState();
        }, 2600);
    }
    useItemOutsideCombat(combatSummary) {
        var tss = [];
        for (var i = 0; i < combatSummary.targetSummaries.length; i++) {
            var ts = combatSummary.targetSummaries[i];
            tss = tss.concat(ts.target.checkTargetSummary(ts));
        }
        var casterImg = combatSummary.caster.getAnimAbility(combatSummary.abilityNum);
        var targets = [combatSummary.caster];
        for (var i = 0; i < tss.length; i++) {
            var ts = tss[i];
            if (!targets.includes(ts.target)) {
                targets.push(ts.target);
            }
        }
        var targetImgs = [undefined];
        var targetTexts = [];
        for (var i = 0; i < targets.length; i++) {
            var texts = [];
            var isAttack = false;
            for (var j = 0; j < tss.length; j++) {
                var ts = tss[j];
                if (ts.target === targets[i]) {
                    texts = texts.concat(targets[i].applyTargetSummary(ts));
                    if (ts.isAttack) {
                        isAttack = true;
                    }
                }
            }
            if (i > 0) { // Not the caster
                if (isAttack) {
                    targetImgs.push(targets[i].getAnimDefend());
                } else {
                    targetImgs.push(targets[i].getAnimIdle());
                }
            }
            targetTexts.push(texts);
        }
        this.updatePositions(combatSummary.targetSummaries);
        this.displayDungeonEvent(combatSummary.text, casterImg, targetImgs, targetTexts);
        setTimeout(() => {
            this.canMove = true;
            this.sendPlayerStatusUpdate();
            this.drawDungeon();
        }, 2600);
    }
    // Takes 2500 to fully transition
    async fadeTransition(toBattle) {
        var alpha = 0;
        var animFadeoutInterval = setInterval(() => {
            if (!toBattle) {
                this.drawBattle();
            } else {
                this.drawDungeon();
            }
            this.mapCanvas.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            this.mapCanvas.fillRect(0, 0, 1200, 900);
            alpha += 0.025;
        }, 25)
        setTimeout(() => {clearInterval(animFadeoutInterval)}, 1000);
        setTimeout(() => {
            var animFadeoutInterval = setInterval(() => {
                if (toBattle) {
                    this.drawBattle();
                } else {
                    this.drawDungeon();
                }
                this.mapCanvas.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                this.mapCanvas.fillRect(0, 0, 1200, 900);
                alpha -= 0.025;
            }, 25)
            setTimeout(() => {
                clearInterval(animFadeoutInterval);
                if (toBattle) {
                    this.drawBattle();
                } else {
                    this.drawDungeon();
                };
            }, 1000);
        }, 1500);
    }
    drawBattle() {
        var charWidth = 130;
        var charSpace = 10;
        var currentChar = this.currentChar;

        this.mapCanvas.fillStyle = "black";
        this.mapCanvas.fillRect(0,0,1200,900);
        var bg = document.getElementById("img:backgroundFloor1");
        this.mapCanvas.drawImage(bg,0,150,1200,600);

        const top_gradient = this.mapCanvas.createLinearGradient(0, 0, 0, 900);
        top_gradient.addColorStop(0, "black");
        top_gradient.addColorStop(0.7, "rgb(0,0,0,0.0)");
        this.mapCanvas.fillStyle = top_gradient;
        this.mapCanvas.fillRect(0, 0, 1200, 900);

        for (var i = 0; i < this.players.length; i++) {
            var x = 420 - i * (charWidth+charSpace);
            var y = 690;
            var heroAnimIdle = document.getElementById(this.players[i].getAnimIdle());
            var width = heroAnimIdle.width / 2.5;
            var height = heroAnimIdle.height / 2.5;
            this.mapCanvas.drawImage(heroAnimIdle,x-(width-charWidth)/2,y-height, width, height);
            this.drawHPBar(this.mapCanvas, this.players[i].hp, this.players[i].maxHp, x, y+5, charWidth);
            this.drawStressBar(this.mapCanvas, this.players[i].stress, this.players[i].maxStress, x, y+25, charWidth);
            var effectOffsetX = x;
            if (this.players[i].onDeathsDoor) {
                var img = document.getElementById("img:deathsDoor");
                this.mapCanvas.drawImage(img,effectOffsetX,y+45,30,30);
                effectOffsetX += 30;
            }
            if (this.players[i].isHopeless) {
                var img = document.getElementById("img:hopeless");
                this.mapCanvas.drawImage(img,effectOffsetX,y+45,30,30);
                effectOffsetX += 30;
            }
            var sortedEffects = this.players[i].getEffects().sort((a,b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            })
            this.drawEffects(this.mapCanvas, sortedEffects, effectOffsetX, y+45, charWidth);
            if (this.players[i] === currentChar) {
                this.mapCanvas.beginPath();
                this.mapCanvas.lineWidth = "5";
                this.mapCanvas.strokeStyle = "#978754";
                this.mapCanvas.rect(x, y+5, charWidth, 35);
                this.mapCanvas.stroke();
            }
        }
        for (var i = 0; i < this.enemies.length; i++) {
            var x = 640 + i * (charWidth+charSpace);
            var y = 690;
            var monsterAnimIdle = document.getElementById(this.enemies[i].getAnimIdle());
            var width = monsterAnimIdle.width / 2.5;
            var height = monsterAnimIdle.height / 2.5;
            this.mapCanvas.drawImage(monsterAnimIdle,x-(width-charWidth)/2,y-height, width, height);
            this.drawHPBar(this.mapCanvas, this.enemies[i].hp, this.enemies[i].maxHp, x, y+5, charWidth);
            var sortedEffects = this.enemies[i].getEffects().sort((a,b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            })
            this.drawEffects(this.mapCanvas, sortedEffects, x, y+25, charWidth);
            if (this.enemies[i] === currentChar) {
                this.mapCanvas.beginPath();
                this.mapCanvas.lineWidth = "5";
                this.mapCanvas.strokeStyle = "#978754";
                this.mapCanvas.rect(x, y+5, charWidth, 20);
                this.mapCanvas.stroke();
            }
        }
    }

    displayBattleAction(actionString, casterAnim, targetsAnim, targetTexts, isEnemy) {
        this.drawBattle();
        const top_gradient = this.mapCanvas.createLinearGradient(0, 0, 0, 900);
        top_gradient.addColorStop(0, "black");
        top_gradient.addColorStop(0.7, "rgb(0,0,0,0.0)");
        top_gradient.addColorStop(1, "black");
        this.mapCanvas.fillStyle = top_gradient;
        this.mapCanvas.fillRect(0, 0, 1200, 900);
        this.mapCanvas.font = "90px ddfont";
        this.mapCanvas.fillStyle = "#978754";
        this.mapCanvas.textAlign = "center"
        this.mapCanvas.fillText(actionString, 600, 200);
        var casterAnimImg = document.getElementById(casterAnim);
        var targetsAnimImg = targetsAnim.map(img => document.getElementById(img));
        setTimeout(() => this.displayAnimation(actionString, casterAnimImg, targetsAnimImg, targetTexts, isEnemy, true), 500);
    }
    displayDungeonEvent(actionString, casterAnim, targetsAnim, targetTexts) {
        this.drawDungeon();
        const top_gradient = this.mapCanvas.createLinearGradient(0, 0, 0, 900);
        top_gradient.addColorStop(0, "black");
        top_gradient.addColorStop(0.7, "rgb(0,0,0,0.0)");
        top_gradient.addColorStop(1, "black");
        this.mapCanvas.fillStyle = top_gradient;
        this.mapCanvas.fillRect(0, 0, 1200, 900);
        this.mapCanvas.font = "90px ddfont";
        this.mapCanvas.fillStyle = "#978754";
        this.mapCanvas.textAlign = "center"
        this.mapCanvas.fillText(actionString, 600, 200);
        var casterAnimImg = document.getElementById(casterAnim);
        var targetsAnimImg = targetsAnim.map(img => document.getElementById(img));
        setTimeout(() => this.displayAnimation(actionString, casterAnimImg, targetsAnimImg, targetTexts, false, false), 500);
    }
    async displayAnimation(actionString, casterAnimImg, targetsAnimImg, targetTexts, isEnemy, isBattle) {
        const top_gradient = this.mapCanvas.createLinearGradient(0, 0, 0, 900);
        top_gradient.addColorStop(0, "black");
        top_gradient.addColorStop(0.7, "rgb(0,0,0,0.0)");
        top_gradient.addColorStop(1, "black");
        var deltaX = 600;
        var animInterval = setInterval(() => {
            if (isBattle) {
                this.drawBattle();
            } else {
                this.drawDungeon();
            }
            this.mapCanvas.fillStyle = top_gradient;
            this.mapCanvas.fillRect(0, 0, 1200, 900);
            this.mapCanvas.font = "90px ddfont";
            this.mapCanvas.fillStyle = "#978754";
            this.mapCanvas.textAlign = "center"
            this.mapCanvas.fillText(actionString, 600, 200);
            if (isEnemy) {
                this.mapCanvas.fillStyle = "#ffcc00";
                this.mapCanvas.font = "60px ddfont";
                this.mapCanvas.drawImage(casterAnimImg,600+deltaX,900-casterAnimImg.height);
                for (var t = 0; t < targetTexts[0].length; t++) {
                    this.mapCanvas.fillText(targetTexts[0][t], 600+deltaX+(casterAnimImg.width/2), 350+t*60);
                }
                var x = targetsAnimImg.length > 1 ? 750-targetsAnimImg[1].width : 350;
                for (var i = 1; i < targetsAnimImg.length; i++) {
                    this.mapCanvas.drawImage(targetsAnimImg[i],x-deltaX-150*i,900-targetsAnimImg[i].height);
                    for (var t = 0; t < targetTexts[i].length; t++) {
                        this.mapCanvas.fillText(targetTexts[i][t], x-deltaX-150*i+(targetsAnimImg[i].width/2), 350+t*60);
                    }
                }
            } else {
                this.mapCanvas.fillStyle = "#ffcc00";
                this.mapCanvas.font = "60px ddfont";
                var x = casterAnimImg.width;
                this.mapCanvas.drawImage(casterAnimImg,600-x-deltaX,900-casterAnimImg.height);
                for (var t = 0; t < targetTexts[0].length; t++) {
                    this.mapCanvas.fillText(targetTexts[0][t], 600-x-deltaX+(casterAnimImg.width/2), 350+t*60);
                }
                for (var i = 1; i < targetsAnimImg.length; i++) {
                    this.mapCanvas.drawImage(targetsAnimImg[i],450+deltaX+150*i,900-targetsAnimImg[i].height);
                    for (var t = 0; t < targetTexts[i].length; t++) {
                        this.mapCanvas.fillText(targetTexts[i][t], 450+deltaX+150*i+(targetsAnimImg[i].width/2), 350+t*60);
                    }
                }
            }
            deltaX = deltaX * 6 / 7;
        }, 25)
        await new Promise(r => setTimeout(() => {
              this.canAct = true;
              clearInterval(animInterval); r
        }, 2000));
    }
    getPlayerResponse(header, texts) {
        this.socket.emit("host_get_player_response", this.roomID, header, texts);
    }
    displayMessage(header, image, desc) {
        this.modal.style.display = "block";
        this.modalText.innerHTML = header;
        this.modalOptions.innerHTML = "";
        this.modalImage.src = image;
        this.modalDesc.innerHTML = desc;
    }
    displayPopup(text, optionText, callbacks) {
        this.modalText.innerHTML = text;
        this.modalOptions.innerHTML = "";
        this.modal.style.display = "block";
        var button = document.createElement('button');
        for (var i = 0; i < optionText.length; i++) {
            var button = document.createElement('button');
            button.id = "popupButton" + i;
            button.innerHTML = optionText[i];
            button.className = "ddButton";
            this.modalOptions.appendChild(button);
            this.modalOptions.innerHTML += "<br>";
        }
        var button = document.createElement('button');
        button.id = "cancelPopup"
        button.innerHTML = "Cancel";
        button.className = "ddButton";
        this.modalOptions.appendChild(button);
        this.modalOptions.innerHTML += "<br>";
        for (var i = 0; i < optionText.length; i++) {
            ((callback) => document.getElementById("popupButton" + i).onclick = (e) => {
                document.getElementById('popup').style.display = 'none';
                callback();
            })(callbacks[i]);
        }
        document.getElementById("cancelPopup").onclick = (e) => {
            document.getElementById('popup').style.display = 'none';
        }
    }
    chooseAbilityPopup(owner, abilities, callbacks) {
        this.modalText.innerHTML = "Choose an ability";
        this.modalOptions.innerHTML = "";
        this.modalOptions.style = "display:inline-block";
        this.modal.style.display = "block";
        for (var i = 0; i < abilities.length; i++) {
            var button = document.createElement('button');
            button.id = "popupButton" + i;
            var imgSrc = document.getElementById(abilities[i].icon).src;
            button.innerHTML = "<img src='" + imgSrc + "' style='width:80px;height:80px'><div style='padding-left:20px;text-align:left;font-size:20px'>" + abilities[i].getHTML() + "</div>";
            button.className = "ddButton";
            if (abilities[i].usableRanks.includes(owner.rank)) {
                button.style = "display:flex;width:100%";
            } else {
                button.style = "display:flex;width:100%;opacity:0.5";
            }
            this.modalOptions.appendChild(button);
            this.modalOptions.innerHTML += "<br>";
        }
        this.modalOptions.innerHTML += "<br>";
        for (var i = 0; i < abilities.length; i++) {
            if (abilities[i].usableRanks.includes(owner.rank)) {
                ((callback) => document.getElementById("popupButton" + i).onclick = (e) => {
                    document.getElementById('popup').style.display = 'none';
                    this.modalOptions.style = "display:inline-block";
                    callback();
                })(callbacks[i]);
            }
        }
    }
};