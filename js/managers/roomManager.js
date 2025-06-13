/// --- Rooms
// --- imports
import * as Hitbox from './hitboxManager.js';
import * as Asset from './assetManager.js';
import {DOORS_IN_ROOM} from "../res/doorData.js";
import {ROOM_BACKGROUNDS} from "../res/assetData.js";


// --- classes
export class Room {
    constructor(roomName) {
        this.name = roomName;

        /// -- assets and hitboxes
        this.doors = DOORS_IN_ROOM.get(roomName).map(id => new Hitbox.door(id));

        this.background = new Asset.image( ROOM_BACKGROUNDS.get(roomName) );

        /// -- visitors
        this.occupiedBy = [];
    }
}

export let allRooms = new Map();
let _currentRoom;

export function getCurrentRoom() { return _currentRoom; }
export function setCurrentRoom(value) { _currentRoom = value; }