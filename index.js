import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Vælg dit __dirname:
// const __dirname = '/var/www/xn--dengyldnel-8cb.dk/public_html/';
// const __dirname = 'C:/Users/Beans/Documents/DrunkestDungeon/public_html/'
const __dirname = '/home/jekla/Documents/custom/DrunkestDungeon/public_html/'

import { Player } from "./public_html/dd/modules/Player.mjs";
import { Dungeon } from "./public_html/dd/modules/Dungeon.mjs";

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = new Server(server);
app.use(express.static(__dirname));

app.get('/dd/host', (req, res) => {
    res.sendFile(__dirname +  'dd/host.html');
});

app.get('/dd/player', (req, res) => {
    res.sendFile(__dirname + 'dd/client.html');
});

var dungeons = [];

function getDungeonFromRoom(roomID) {
    return dungeons.find((d) => d.roomID == roomID);
}

io.on('connection', (socket) => {
    console.log('Someone connected...');
    socket.emit("greetings");

    socket.on("host_setup_request", (msg) => {
        var roomID = 0;
        var existingDungeon = undefined;
        do {
            roomID = (999 + Math.ceil(Math.random() * 9000)).toString();
            existingDungeon = getDungeonFromRoom(roomID);
        } while (!(existingDungeon === undefined));
        var newDungeon = new Dungeon(socket, roomID);
        dungeons.push(newDungeon);
        socket.join(newDungeon.roomID);
        socket.emit("host_setup_response", newDungeon.roomID);
        console.log("New room " + newDungeon.roomID + " hosted by socket " + socket.id);
    });

    socket.on("cheat_setup_host", () => {
        var roomID = 0;
        var newDungeon = new Dungeon(socket, roomID);
        dungeons.push(newDungeon);
        socket.join(newDungeon.roomID);
    })

    socket.on("cheat_setup_player1", (socketID) => {
        dungeons[dungeons.length-1].addPlayer("Jeans", socketID);
        dungeons[dungeons.length-1].socket.emit("cheat_setup_player1");
        socket.join(dungeons[dungeons.length-1].roomID);
        socket.emit("cheat_room_ID", dungeons[dungeons.length-1].roomID);
    });

    socket.on("player_join_request", (playerName, roomID) => {
        console.log(playerName + " (" + socket + ") requests to join room " + roomID);
        var dungeon = getDungeonFromRoom(roomID.toString());
        if (!(dungeon === undefined)) {
            if (dungeon.players.length < 4) {
                dungeon.addPlayer(playerName, socket);
                var room = dungeon.roomID;
                socket.join(room);
                socket.emit("player_join_response", 0, "All good.", socket.id);
                socket.to(room).emit("broadcast_player_join", playerName, socket.id);
                console.log(playerName + " joined room " + room)
            } else {
                if (!(dungeon.getPlayer(playerName) === undefined)) {
                	var room = dungeon.roomID;
                	socket.join(room);
                  	dungeon.reactivatePlayer(playerName, socket)
                    dungeon.socket.emit("player_rejoin_request", playerName);
                } else {
                    socket.emit("player_join_response", 2, "Room is full.");
                    console.log("Room is full.");
                }
            }
        } else {
            console.log("No such room.");
            socket.emit("player_join_response", (1, "No such room exists."));
        }
    });

    socket.on("player_rejoin_request", (playerName, roomID) => {
        console.log(playerName + " (" + socket + ") requests to rejoin room " + roomID);
        var dungeon = getDungeonFromRoom(roomID.toString());
        if (!(dungeon === undefined)) {
            var player = dungeon.getPlayer(playerName);
            if (!(player === undefined)) {
                if (!player.active) {
                    dungeon.reactivatePlayer(playerName, socket);
                    socket.emit("player_rejoin_response", (0, "All good."));
                } else {
                    socket.emit("player_rejoin_response", (3, "Player is already active"));
                }
            } else {
                socket.emit("player_rejoin_response", (2, "Player is not member of this room."));
            }
        } else {
            console.log("No such room.");
            socket.emit("player_rejoin_response", (1, "No such room exists."));
        }
    });

    socket.on("host_start_draft_phase", (roomID) => {
        console.log("Drafting!")
        console.log(roomID)
        var dungeon = getDungeonFromRoom(roomID);
        var currentPlayer = dungeon.players[dungeon.draftState];
        io.to(roomID).emit("all_next_player_to_draft", currentPlayer.name, [0,0,0,0]);
    });
    socket.on("player_draft_finish", (roomID, playerName, classChosen) => {
        socket.to(roomID).emit("player_draft_finish", roomID, playerName, classChosen);
        console.log("Room:" + roomID);
        var dungeon = getDungeonFromRoom(roomID);
        var currentPlayer = dungeon.players[dungeon.draftState];
        currentPlayer.class = classChosen;
        dungeon.nextDraftState();
        var nextPlayer = dungeon.players[dungeon.draftState];
        if (dungeon.draftState < 4) {
            io.to(roomID).emit("all_next_player_to_draft", nextPlayer.name, dungeon.classes)
        } else {
            io.to(roomID).emit("all_game_begins");
        }
    });

    // =========
    // Main game
    // =========

    socket.on("player_status_update", (roomID, partyData, enemyData, movementStatus, inventory) => {
        io.to(roomID).emit("player_status_update", partyData, enemyData, movementStatus, inventory);
    });

    socket.on("player_use_ability", (roomID, playerName, abilityNum, target) => {
        var dungeon = getDungeonFromRoom(roomID);
        dungeon.socket.emit("player_use_ability", playerName, abilityNum, target);
    });

    socket.on("player_use_item", (roomID, playerName, item, target) => {
        var dungeon = getDungeonFromRoom(roomID);
        dungeon.socket.emit("player_use_item", playerName, item, target);
    });

    socket.on("player_send_response", (roomID, action, playerName) => {
        var dungeon = getDungeonFromRoom(roomID);
        dungeon.socket.emit("player_send_response", action, playerName);
    });

    socket.on("player_move_room", (roomID, playerName, dir) => {
        var dungeon = getDungeonFromRoom(roomID);
        dungeon.socket.emit("player_move_room", playerName, dir);
    });

    socket.on("host_get_player_response", (roomID, header, texts, callback) => {
        io.to(roomID).emit("host_get_player_response", header, texts, callback);
    })

    socket.on("host_close_popup", (roomID) => {
        io.to(roomID).emit("host_close_popup", true);
    })

  	socket.on("host_send_class", (roomID, playerName, playerClass) => {
        io.to(roomID).emit("host_send_class", playerName, playerClass);
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket.rooms != undefined) {
            for (var i = 0; i < socket.rooms.length; i++) {
                var room = socket.rooms[i];
                var dungeon = getDungeonFromRoomID(room);
                if (!(dungeon === undefined)) {
                    dungeon.deactivatePlayer(socket.id);
                    socket.to(room).emit("broadcast_player_left", socket.id);
                }
            }
        }
    });
});

console.log("starting up...");
server.listen(50005, () => {
  console.log('server running at http://dengyldneøl.dk:50005/dd');
});