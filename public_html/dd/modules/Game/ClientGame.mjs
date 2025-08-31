import { getRandomInt } from "../DiceRoll.mjs";
import { TargetSummary, CombatSummary } from "../Ability/Ability.mjs";
import { Corpse } from "../Class/Character.mjs";
import { Game } from "./Game.mjs";
import { getItemFromName } from "../Item/Item.mjs";
import { Foresight } from "../Effect.mjs";

export class ClientGame extends Game {
    inventory = [];
    playerClass = undefined;
    constructor(socket, roomID) {
        super(socket, roomID);
        this.playerClass = undefined;
        this.sips = 0;
        this.sipsTaken = 0;
        this.effects = [];
        this.inventory = [];
        this.canUseAbilities = false;
        this.canUseItems = false;
        this.isPartyLeader = false;
        this.titlePlayerName = document.getElementById("titlePlayerName");
        this.titlePlayerClass = document.getElementById("titlePlayerClass");
        this.imgPlayerClass = document.getElementById("imgPlayerClass");
        this.hopelessStatus = document.getElementById("hopelessStatus");
        this.playerHP = document.getElementById("playerHP");
        this.playerStress = document.getElementById("playerStress");
        this.playerStrength = document.getElementById("playerStrength");
        this.playerEffects = document.getElementById("playerEffects");
        this.playerPosition = document.getElementById("playerPosition");
        this.playerAbilities = document.getElementById("playerAbilities");
        this.playerSips = document.getElementById("playerSips");
        this.playerItems = document.getElementById("playerItems");
        this.playersOwnTurn = false;
        this.updateGameScreen = this.updateGameScreen.bind(this);
    }
    updatePlayerDisplay() {
        this.playerDisplay.innerHTML = "";
        for (var i = 0; i < this.players.length; i++) {
            this.playerDisplay.innerHTML += this.players[i].name + "<br>";
        }
    }

    // ============
    // Client stuff
    // ============
    getOwnData() {
        return this.partyData.find((p) => p.name == this.playerClass.name);
    }
    updateOwnData(playerData, playerRank) {
        this.playerClass.hp = playerData.hp.current;
        this.playerClass.maxHp = playerData.hp.max;
        this.playerClass.stress = playerData.stress.current;
        this.playerClass.maxStress = playerData.stress.max;
        this.playerClass.strength = playerData.strength;
        this.playerClass.onDeathsDoor = playerData.onDeathsDoor;
        this.playerClass.isHopeless = playerData.isHopeless;
        this.playerClass.effects = [];
        for (var i = 0; i < playerData.effects.length; i++) {
            if (playerData.effects[i].name == "foresight") {
                this.playerClass.effects.push(new Foresight(this.playerClass));
            }
        }
        this.effects = playerData.effects;
        this.playerClass.rank = playerRank;
        this.sips = playerData.sips;
        this.isPartyLeader = playerRank == 1;
    }
    updateData(newPartyData, newEnemyData, movementStatus, inventory) {
        this.partyData = newPartyData;
        this.enemyData = newEnemyData;
        var playerRank = this.partyData.findIndex((p) => p.name == this.playerClass.name)+1;
        this.updateOwnData(this.getOwnData(), playerRank);
        document.getElementById("movementUpButton").style.display = "none";
        document.getElementById("movementLeftButton").style.display = "none";
        document.getElementById("movementRightButton").style.display = "none";
        document.getElementById("movementDownButton").style.display = "none";
        document.getElementById("movementContinueButton").style.display = "none";
        this.canMove = movementStatus.canMove;
        this.inCombat = movementStatus.inCombat;
        if (this.isPartyLeader && movementStatus.canMove) {
            document.getElementById("playerMovement").style.display = "grid";
            for (var i = 0; i < movementStatus.dirs.length; i++) {
                switch(movementStatus.dirs[i]) {
                    case ("up"):
                        document.getElementById("movementUpButton").style.display = "block";
                        break;
                    case ("left"):
                        document.getElementById("movementLeftButton").style.display = "block";
                        break;
                    case ("right"):
                        document.getElementById("movementRightButton").style.display = "block";
                        break;
                    case ("down"):
                        document.getElementById("movementDownButton").style.display = "block";
                        break;
                    case ("continue"):
                        document.getElementById("movementContinueButton").style.display = "block";
                        break;
                }
            }
        } else {
            document.getElementById("playerMovement").style.display = "none";
        }
        this.inventory = inventory;
    }

    clearSips() {
        this.sipsTaken = this.sips;
        this.updateGameScreen();
    }

    updateGameScreen() {
        this.titlePlayerName.innerHTML = this.playerClass.name;
        this.titlePlayerClass.innerHTML = "The " + this.playerClass.title;
        if (!this.playerClass.isHopeless) {
            this.imgPlayerClass.src = "images/heroes/" + this.heroNames[this.playerClass.id] + "/display.png";
            // this.hopelessStatus.style = "display:none";
        } else {
            this.imgPlayerClass.src = "images/heroes/" + this.heroNames[this.playerClass.id] + "/display_hopeless.png";
            // this.hopelessStatus.style = "display:block;color:#c91e27";
        }
        this.playerHP.innerHTML = "";
        for (var i = 0; i < this.playerClass.maxHp; i++) {
            var hpToken = document.createElement('img');
            if (this.playerClass.hp > i) {
                hpToken.src = "images/playericons/hpToken_full.png";
            } else {
                hpToken.src = "images/playericons/hpToken_empty.png";
            }
            hpToken.className = "statusIcon";
            this.playerHP.appendChild(hpToken);
        }
        this.playerStress.innerHTML = "";
        for (var i = 0; i < this.playerClass.maxStress; i++) {
            var stressToken = document.createElement('img');
            if (this.playerClass.stress > i) {
                stressToken.src = "images/playericons/stressToken_full.png";
            } else {
                stressToken.src = "images/playericons/stressToken_empty.png";
            }
            stressToken.className = "statusIcon";
            this.playerStress.appendChild(stressToken);
        }
        this.playerStrength.innerHTML = "";
        for (var i = 0; i < this.playerClass.strength; i++) {
            var strengthToken = document.createElement('img');
            strengthToken.src = "images/playericons/strengthToken.png";
            strengthToken.className = "statusIcon";
            this.playerStrength.appendChild(strengthToken);
        }
        this.playerEffects.innerHTML = "";
        if (this.playerClass.onDeathsDoor) {
            var ddToken = document.createElement('img');
            ddToken.src = document.getElementById("img:deathsDoor").src;
            ddToken.className = "statusIcon";
            this.playerEffects.appendChild(ddToken);
        }
        if (this.playerClass.isHopeless) {
            var hopelessToken = document.createElement('img');
            hopelessToken.src = document.getElementById("img:hopeless").src;
            hopelessToken.className = "statusIcon";
            this.playerEffects.appendChild(hopelessToken);
        }
        var sortedEffects = this.effects.sort((a,b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
            return 0;
        })
        for (var i = 0; i < sortedEffects.length; i++) {
            var effect = sortedEffects[i];
            var effectToken = document.createElement('img');
            effectToken.src = document.getElementById(effect.icon).src;
            effectToken.className = "statusIcon";
            this.playerEffects.appendChild(effectToken);
        }
        this.playerSips.innerHTML = "";
        for (var i = 1; i <= this.sips; i++) {
            var beer = document.createElement('img');
            beer.src = "images/playericons/sips.png";
            if (i <= this.sipsTaken) {
                beer.className = "sipTaken";
            } else {
                beer.className = "sipNotTaken";
            }
            this.playerSips.appendChild(beer);
            if (i % 12 == 0) {
                this.playerSips.innerHTML += "<br><br>";
            }
        }
        var drinkButton = document.getElementById("drinkSips");
        if (this.sipsTaken < this.sips) {
            drinkButton.style.display = "block";
            document.getElementById("drinkSips").onclick = (e) => {
                this.clearSips();
            };
            this.playerAbilities.innerHTML = "";
            this.playerItems.innerHTML = "";
            return;
        } else {
            drinkButton.style.display = "none";
        }
        this.playerPosition.innerHTML = "Position: " + this.playerClass.rank;
        this.playerAbilities.innerHTML = "";
        var button = document.createElement('button');
        button.id = "passiveButton";
        var imgSrc = document.getElementById(this.playerClass.passive.icon).src;
        button.className = "ddButton";
        if (!this.playerClass.isHopeless) {
            button.style.border = "4px solid #fefefe";
            button.style.color = "#978754";
            button.innerHTML = "<img src='" + imgSrc + "' style='width:80px;height:80px'><div style='padding-left:20px;text-align:left;font-size:50px'>" + this.playerClass.passive.getHTML() + "</div>";
        } else {
            if (this.playerClass.title == "Occultist") {
                button.style.border = "4px solid #185519";
                button.style.color = "#185519";
                button.innerHTML = "<img src='" + imgSrc + "' style='width:80px;height:80px'><div style='padding-left:20px;text-align:left;font-size:50px'><s>" + this.playerClass.passive.getHTML() + "<s></div>";
            } else {
                button.style.border = "4px solid #852929";
                button.style.color = "#852929";
                button.innerHTML = "<img src='" + imgSrc + "' style='width:80px;height:80px'><div style='padding-left:20px;text-align:left;font-size:50px'><s>" + this.playerClass.passive.getHTML() + "</s></div>";
            }
        }
        this.playerAbilities.appendChild(button);
        this.playerAbilities.innerHTML += "<br>";
        var abilities = this.playerClass.isHopeless ? this.playerClass.h_abilities : this.playerClass.abilities;
        for (var i = 0; i < abilities.length; i++) {
            var button = document.createElement('button');
            button.id = "abilityButton" + i;
            var imgSrc = document.getElementById(abilities[i].icon).src;
            button.innerHTML = "<img src='" + imgSrc + "' style='width:80px;height:80px'><div style='padding-left:20px;text-align:left;font-size:50px'>" + abilities[i].getHTML() + "</div>";
            button.className = "ddButton";
            if (abilities[i].usableRanks.includes(this.playerClass.rank) || !this.inCombat) {
                button.style.border = "4px solid #fefefe";
                button.style.color = "#978754";
            } else {
                button.style.border = "4px solid #444444";
                button.style.color = "#444444";
            }
            this.playerAbilities.appendChild(button);
            this.playerAbilities.innerHTML += "<br>";
        }
        var swapButton = document.createElement('button');
        swapButton.id = "swapButton";
        var imgSrc = document.getElementById(this.playerClass.swapAbility.icon).src;
        swapButton.innerHTML = "<img src='" + imgSrc + "' style='width:80px;height:80px'><div style='padding-left:20px;text-align:left;font-size:50px'>" + this.playerClass.swapAbility.getHTML() + "</div>";
        swapButton.className = "ddButton";
        if (this.inCombat || this.canMove) {
            swapButton.style = "display:flex;width:100%;border: 4px solid #fefefe; color: #978754";
        } else {
            swapButton.style = "display:flex;width:100%;border: 4px solid #444444; color: #444444";
        }
        this.playerAbilities.appendChild(swapButton);
        this.playerAbilities.innerHTML += "<br>";
        this.playerItems.innerHTML = "";
        for (var i = 0; i < this.inventory.length; i++) {
            var item = getItemFromName(this.inventory[i], this);
            var button = document.createElement('button');
            button.id = "itemButton" + i;
            button.innerHTML = "<img src='" + item.imageSrc + "' style='width:80px'><div style='padding-left:20px;text-align:left;font-size:50px'>" + item.getHTML() + "</div>";
            button.className = "ddButton";
            if (item.usableInCombat || this.canMove) {
                button.style = "display:flex;width:100%";
            } else {
                button.style = "display:flex;width:100%;opacity:0.5";
            }
            this.playerItems.appendChild(button);
            this.playerItems.innerHTML += "<br>";
        }
        document.getElementById("movementUpButton").addEventListener("click", () => {
            this.socket.emit("player_move_room", this.roomID, this.playerClass.name, "up");
        });
        document.getElementById("movementLeftButton").addEventListener("click", () => {
            this.socket.emit("player_move_room", this.roomID, this.playerClass.name, "left");
        });
        document.getElementById("movementRightButton").addEventListener("click", () => {
            this.socket.emit("player_move_room", this.roomID, this.playerClass.name, "right");
        });
        document.getElementById("movementDownButton").addEventListener("click", () => {
            this.socket.emit("player_move_room", this.roomID, this.playerClass.name, "down");
        });
        document.getElementById("movementContinueButton").addEventListener("click", () => {
            this.socket.emit("player_move_room", this.roomID, this.playerClass.name, "continue");
        });
        for (var i = 0; i < abilities.length; i++) {
            if (abilities[i].usableRanks.includes(this.playerClass.rank) && this.inCombat) {
                ((abilityNum) => document.getElementById("abilityButton" + i).onclick = (e) => {
                    this.clearPopup();
                    if (!this.playerClass.isHopeless) {
                        this.playerClass.abilities[abilityNum].actPlayer(this.partyData, this.enemyData, abilityNum);
                    } else {
                        this.playerClass.h_abilities[abilityNum].actPlayer(this.partyData, this.enemyData, abilityNum);
                    }
                })(i);
            }
        }
        if (this.inCombat || this.canMove) {
            document.getElementById("swapButton").onclick = (e) => {
                this.clearPopup();
                this.playerClass.swapAbility.actPlayer(this.partyData, this.enemyData, -1);
            }
        }
        for (var i = 0; i < this.inventory.length; i++) {
            var item = getItemFromName(this.inventory[i], this);
            if (item.usableInCombat || (!this.inCombat && this.canMove)) {
                ((itemNum) => document.getElementById("itemButton" + itemNum).onclick = (e) => {
                    this.clearPopup();
                    getItemFromName(this.inventory[itemNum], this).actPlayer(this.partyData, this.enemyData);
                })(i);
            }
        }
    }
    sendAbilityUse(abilityNum, target) {
        this.socket.emit("player_use_ability", this.roomID, this.playerClass.name, abilityNum, target)
    }
    sendItemUse(item, target) {
        this.socket.emit("player_use_item", this.roomID, this.playerClass.name, item, target)
    }

    allDead(chars) {
    }
};