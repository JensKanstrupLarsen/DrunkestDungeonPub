import { getRandomInt } from "../DiceRoll.mjs";
import { TargetSummary, CombatSummary } from "../Ability/Ability.mjs";
import { Corpse } from "../Class/Character.mjs";
import { Antiquarian, BountyHunter, Crusader, GraveRobber, Hellion, Jester, Leper, ManAtArms, Occultist, PlagueDoctor } from "../Class/Hero.mjs";

export class Game {
    clients = [];
    players = [];
    enemies = [];
    inventory = [];
    roomID = 0;
    heroNames = {
        1 : "antiquarian",
        2 : "bountyhunter",
        3 : "crusader",
        4 : "graverobber",
        5 : "hellion",
        6 : "jester",
        7 : "leper",
        8 : "manatarms",
        9 : "occultist",
        10 : "plaguedoctor"
    }
    heroNamesCaps = {
        1 : "Antiquarian",
        2 : "Bounty Hunter",
        3 : "Crusader",
        4 : "Grave Robber",
        5 : "Hellion",
        6 : "Jester",
        7 : "Leper",
        8 : "Man-at-Arms",
        9 : "Occultist",
        10 : "Plague Doctor"
    }
    modal = document.getElementById("popup");
    modalText = document.getElementById("popupText");
    modalOptions = document.getElementById("popupOptions");
    modalItems = document.getElementById("popupItems");
    modalImage = document.getElementById("popupImage");
    modalDesc = document.getElementById("popupDesc");
    inCombat = false;
    inRoom = true;
    inCorridor = false;
    canMove = false;
    nextRoom = 0;

    constructor(socket, roomID) {
        this.socket = socket;
        this.roomID = roomID;
    }
    startGame() {
    }
    getHeroFromNumber(n, playerName) {
        switch (n) {
            case 1:
                return new Antiquarian(this, playerName, true, 0, this.socket);
            case 2:
                return new BountyHunter(this, playerName, true, 0, this.socket);
            case 3:
                return new Crusader(this, playerName, true, 0, this.socket);
            case 4:
                return new GraveRobber(this, playerName, true, 0, this.socket);
            case 5:
                return new Hellion(this, playerName, true, 0, this.socket);
            case 6:
                return new Jester(this, playerName, true, 0, this.socket);
            case 7:
                return new Leper(this, playerName, true, 0, this.socket);
            case 8:
                return new ManAtArms(this, playerName, true, 0, this.socket);
            case 9:
                return new Occultist(this, playerName, true, 0, this.socket);
            case 10:
                return new PlagueDoctor(this, playerName, true, 0, this.socket);
        }
    }

    getImageSrc(img) {
        return document.getElementById(img).src;
    }
    allDead(chars) {
    }
    drawEffects(ctx, effects, x, y, maxWidth) {
        var hidden = 0;
        for (var i = 0; i < effects.length; i++) {
            var effect = effects[i];
            if (effect.name != "protecting") {
                var img = document.getElementById(effect.getIcon());
                ctx.drawImage(img,x+(i-hidden)*30,y,30,30);
            } else {
                hidden += 1;
            }
        }
    }
    drawHPBar(ctx, currentHp, maxHp, x, y, maxWidth) {
        var hpWidth = maxWidth / maxHp;
        for (var hp = 0; hp < maxHp; hp++) {
            if (currentHp > hp) {
                ctx.fillStyle = "red";
                ctx.fillRect(x+hpWidth*hp, y, hpWidth, 15);
            }
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "maroon";
            ctx.rect(x+hpWidth*hp, y, hpWidth, 15);
            ctx.stroke();
        }
    }
    drawStressBar(ctx, currentStress, maxStress, x, y, maxWidth) {
        var stressWidth = maxWidth / maxStress;
        for (var stress = 0; stress < maxStress; stress++) {
            if (currentStress > stress) {
                ctx.fillStyle = "white";
                ctx.fillRect(x+stressWidth*stress, y, stressWidth, 15);
            }
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "black";
            ctx.rect(x+stressWidth*stress, y, stressWidth, 15);
            ctx.stroke();
        }
    }

    newSocketPopup(popupType, text, optionText) {
        this.modalText.innerHTML = text;
        this.modalOptions.innerHTML = "";
        this.modal.style.display = "block";
        for (var i = 0; i < optionText.length; i++) {
            this.modalOptions.innerHTML +=
                "<button class=\"ddButton\" onclick=\"popupSocketReply("
                + popupType
                + ","
                + i
                + ")\">"
                + optionText[i]
                + "</button><br>";
        }
        this.modalOptions.innerHTML += "<br>";
    }
    // popupInfo : { header, image, desc }
    // options : [String]
    // callbacks : [() => ()]
    newLocalPopup(popupInfo, options, callbacks, allowCancel) {
        this.modal.style.display = "block";
        this.modalText.innerHTML = popupInfo.header;
        this.modalImage.style.display = "block";
        this.modalImage.src = popupInfo.image;
        this.modalItems.style.display = "none";
        this.modalDesc.innerHTML = popupInfo.desc;
        this.modalOptions.style.display = "block";
        var button = document.createElement('button');
        for (var i = 0; i < options.length; i++) {
            var button = document.createElement('button');
            button.id = "popupButton" + i;
            button.innerHTML = options[i];
            button.className = "ddButton";
            button.style.width = "50%";
            button.style.marginLeft = "25%";
            button.style.fontSize = "50px";
            this.modalOptions.appendChild(button);
            this.modalOptions.innerHTML += "<br>";
        }
        if (allowCancel) {
            document.getElementById("cancelPopup").style.display = "block";
        } else {
            document.getElementById("cancelPopup").style.display = "none";
        }
        for (var i = 0; i < options.length; i++) {
            ((callback) => document.getElementById("popupButton" + i).onclick = (e) => {
                document.getElementById('popup').style.display = 'none';
                callback();
            })(callbacks[i]);
        }
        if (allowCancel) {
            document.getElementById("cancelPopup").onclick = (e) => {
                document.getElementById("cancelPopup").style.display = "none";
                document.getElementById('popup').style.display = 'none';
            }
        }
    }
    // items : [Item]
    newLootPopup(items) {
        this.modal.style.display = "block";
        this.modalText.innerHTML = "You found:";
        this.modalImage.style.display = "none";
        this.modalItems.style.display = "block";
        this.modalItems.innerHTML = "";
        this.modalDesc.innerHTML = "";
        this.modalOptions.style.display = "none";
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var img = document.createElement('img');
            img.src = item.imageSrc;
            img.className = "lootItem";
            img.style.height = "200px";
            img.style.width = "auto";
            this.modalItems.className = "lootBar";
            this.modalItems.appendChild(img);
        }
        document.getElementById("cancelPopup").style.display = "none";
    }
    clearPopup() {
        this.modalText.innerHTML = "";
        this.modalImage.src = "";
        this.modalDesc.innerHTML = "";
        this.modalOptions.innerHTML = "";
        this.modal.style.display = "none";
    }
    popupSocketReply(popupType, option) {
        socket.emit(popupType + "_reply", option);
        this.modal.style.display = "none";
    }
    getTargetPopup(imgs, hps, maxHps, callbacks) {
        this.modal.style.display = "block";
        this.modalText.innerHTML = "Choose a target";
        this.modalOptions.innerHTML = "";
        this.modalImage.style.display = "none";
        this.modalItems.style.display = "none";
        this.modalOptions.style.display = "block";
        for (var i = 0; i < imgs.length; i++) {
            var targetDiv = document.createElement('div');
            targetDiv.style = "width:20%;display:inline-block;margin:10px";
            var targetButton = document.createElement('img');
            targetButton.src = document.getElementById(imgs[i]).src;
            targetButton.id = "targetButton" + i;
            targetButton.style = "display:block;width:100%;height:auto";
            var targetCanvas = document.createElement('canvas');
            targetCanvas.id = "targetCanvas" + i;
            targetCanvas.style = "display:block;width:100%;height:30";
            targetDiv.appendChild(targetButton);
            targetDiv.appendChild(targetCanvas);
            this.modalOptions.appendChild(targetDiv);
        }
        this.modalOptions.innerHTML += "<br>";
        for (var i = 0; i < imgs.length; i++) {
            var canvas = document.getElementById("targetCanvas" + i);
            this.drawHPBar(canvas.getContext("2d"), hps[i], maxHps[i], 0, 0, canvas.width);
        }
        for (var i = 0; i < imgs.length; i++) {
            ((callback) => document.getElementById("targetButton" + i).onclick = (e) => {
                this.clearPopup();
                callback();
            })(callbacks[i]);
        }
        document.getElementById("cancelPopup").style.display = "block";
        document.getElementById("cancelPopup").onclick = (e) => {
            document.getElementById("cancelPopup").style.display = "none";
            this.clearPopup();
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
                    this.clearPopup();
                    this.modalOptions.style = "display:inline-block";
                    callback();
                })(callbacks[i]);
            }
        }
    }
};