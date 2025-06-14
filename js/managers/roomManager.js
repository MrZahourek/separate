/// --- Rooms
// --- imports
import * as Hitbox from './hitboxManager.js';
import * as Asset from './assetManager.js';
import {CLOSETS_IN_ROOM, DOORS_IN_ROOM, ROOMS_AROUND} from "../res/doorData.js";
import {ROOM_BACKGROUNDS} from "../res/assetData.js";


// --- classes
export class Room {
    constructor(roomName) {
        this.name = roomName;

        /// -- assets and hitboxes
        this.doors = DOORS_IN_ROOM.get(roomName).map(id => new Hitbox.door(id));
        this.closets = CLOSETS_IN_ROOM.get(roomName).map(id => new Hitbox.closet(id));

        this.background = new Asset.image( ROOM_BACKGROUNDS.get(roomName) );

        /// -- AI
        this.occupiedBy = [];

        this.roomsAround = ROOMS_AROUND.get(roomName);
        this.sound = 0;
    }
}

export class Closet {
    constructor(closetID) {
        this.id = closetID;

        // -- assets & hitboxes
        this.closedImg = new Asset.image();
        this.openImg = new Asset.image();
        this.visitorInside = null;

        this.state = "closed";

        // -- visitor
        this.occupiedBy = null;
    }
}

export let allRooms = new Map();
let _currentRoom;

export function getCurrentRoom() { return _currentRoom; }
export function setCurrentRoom(value) { _currentRoom = value; }