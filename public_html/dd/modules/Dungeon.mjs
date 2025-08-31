import { Player } from "./Player.mjs";

export class Dungeon {
  players = [];
  roomID = 0;
  draftState = 0;
  constructor(socket, roomID) {
    this.socket = socket;
    this.draftState = 0;
    this.roomID = roomID;
    console.log("New dungeon with id " + this.roomID);
  }
  get draftState() {
    return this.draftState;
  }
  nextDraftState() {
    this.draftState += 1;
  }
  get roomID() {
    return this.roomID;
  }
  get players() {
    return this.players;
  }
  get classes() {
    var classes = [];
    for (let i = 0; i < this.players.length; i++) {
      classes.push(this.players[i].class);
    }
    return classes;
  }
  addPlayer(playerName, socket) {
  	this.players.push(new Player(playerName, socket));
  }
  isMember(socketID) {
    return this.players.some((p) => p.socket.id == socketID);
  }
  getPlayer(playerName) {
    return this.players.find((p) => p.name == playerName);
  }
  deactivatePlayer(socketID) {
  	var player = this.players.find((p) => p.socket.id == socketID);
    if (!(player === undefined)) {
      player.active = false;
    }
  }
  reactivatePlayer(playerName, newSocket) {
    var player = this.players.find((p) => p.name == playerName);
    if (!(player === undefined)) {
      player.socket = newSocket;
      player.active = true;
    }
  }
};