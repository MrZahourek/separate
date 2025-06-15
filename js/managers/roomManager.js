/// --- Rooms
// --- imports
import * as Hitbox from './hitboxManager.js';
import * as Asset from './assetManager.js';
import {CLOSETS_IN_ROOM, DOORS_IN_ROOM, ROOMS_AROUND} from "../res/doorData.js";
import {ROOM_BACKGROUNDS} from "../res/assetData.js";
import {_rand, _removeItem, activeIntervals, TimeManager} from "./timeManager.js";
import {ITEMS_IN_ROOM, ROOM_FAVORITES} from "../res/visitorData.js";
import {activeVisitors, allVisitors, inactiveVisitors} from "./visitorManager.js";


// --- classes
export class Room {
    constructor(roomName) {
        this.name = roomName;
        this.id = 0;

        /// -- assets and hitboxes
        this.doors =   DOORS_IN_ROOM.get(roomName).map(id => new Hitbox.door(id));
        this.closets = CLOSETS_IN_ROOM.get(roomName).map(id => new Hitbox.closet(id));

        this.background = new Asset.image( ROOM_BACKGROUNDS.get(roomName) );

        /// -- AI
        this.occupiedBy =      [];
        this.spawnedVisitors = [];
        this.items =           ITEMS_IN_ROOM.get(roomName).map(id => new Closet(id));
        this.favorite =        ROOM_FAVORITES.get(roomName);

        this.ticks =   0;
        this.status = "active";
        this.heat =   0;
        this.failed = 0;

        this.increase =  { cur: 0, min: 1, max: 3 };
        this.threshold = { cur: 0, min: 25, max: 75 };
        this.sleep =     { lastSleepTick: 0, min: 2, max: 6 };

        this.roomsAround = ROOMS_AROUND.get(roomName);
        this.sound =       0;
    }

    /// ────────────────── onBlock - when room spawns room blocker visitor
    onRoomBlock() {
        console.info(`${this.name} room blocked`);
        // Handle visitors in the room
        for (let i = 0; i < this.occupiedBy.length; i++) {
            const visitor = this.occupiedBy[i];
            let spawnSuccess = false;

            for (const otherRoom of allRooms.values()) {

                // check if the room inst the same as this room
                if (otherRoom.name !== this.name) {
                    // spawn that visitor in all rooms until it spawns

                    if (otherRoom.spawn(visitor) === true) {
                        spawnSuccess = true; // so we can move to the other
                        break; // end this loop
                    }
                }
            }

            if (spawnSuccess === false) {
                i--; // i-- causes repeat
            }
        }

        // clear out the visitors here and not in the for cycle
        this.occupiedBy = [];

        // Handle any visitors inside closets
        for (const place of this.items) {
            const visitor = place.occupiedBy[0];
            if (!visitor) { continue; } // skip the place if its empty

            // use a while loop this time since the for is different and we can't force a repeat
            let spawnSuccess = false;
            while (!spawnSuccess) {
                for (const otherRoom of allRooms.values()) {
                    // check if the room inst the same as this room
                    if (otherRoom.name !== this.name) {
                        // spawn that visitor in all rooms until it spawns

                        if (otherRoom.spawn(visitor) === true) {
                            spawnSuccess = true; // so we can move to the other
                            place.occupiedBy = []; // empty the place
                            break; // end this loop
                        }
                    }
                }
                // if still !spawnSuccess, the while loop repeats until it can spawn
            }
        }
    }
    /// ────────────────── spawning visitors
    spawn (visitor) {
        let wtf = "its fine";
        if (visitor === undefined || visitor === null) {
            console.info("no spawn visitor is undefined");
            wtf = "its not fine";
            return;
        }

        if (wtf === "its not fine") {
            console.warn("WHAT THE ACTUAL FUCK");
        }

        /// ────────────── pick a spawn spot
        let location;

        let valid = [];
        for  (const place of visitor.spawnPlaces) {
            if (place === "room") {
                valid.push(this);
            }
            else {
                const available = this.items.filter(item => item.constructor.name.toLowerCase() === place && item.occupiedBy.length === 0);
                valid.push(...available);
            }
        }

        if (valid.length === 0) {
            console.warn(`No valid spawn location for ${visitor.name} in ${this.name}`);
            return false;
        }

        if (valid.length === 2) {
            location = valid[Math.random() < 0.5 ? 0 : 1]; // because of the way random numbers are generated a random int between 0 and 1 will always be 0
        }
        else {
            location = valid[_rand(0, (valid.length - 1))];
        }

        /// ────────────── trigger room block
        if (visitor.ability.includes("room blocker")) {
            console.info(`[${this.name}]: the visitor ${visitor.name} triggered room block`);
            this.onRoomBlock();
        }

        /// ────────────── update canvas manager
        console.info(`about to spawn: ${visitor}`);
        window.dispatchEvent(
            new CustomEvent("visitor spawn", {
                detail: {
                    item: location.constructor.name.toLowerCase(),
                    itemID: location.id,
                    to: this,
                    visitor: visitor
                }
            }),
        );

        /// ────────────── update arrays and spawn counter
        visitor.spawnCounter++;
        location.occupiedBy.push(visitor);

        _removeItem(inactiveVisitors, visitor)
        activeVisitors.push(visitor);

        visitor.isActive = true;

        if (location.constructor.name === "Room") {
            this.spawnedVisitors.push(visitor.name);
        }

        console.debug(`[${this.name}] spawning visitor: ${visitor.name} was a success, it ended in: ${location.constructor.name} \n visitors in room: ${this.occupiedBy}`);
        return true;
    }

    /// ────────────────── sorting visitors for spawning
    spawnSort() {
        /// ────────────── get accessible spawn spots
        let spaces = [];
        this.items.forEach(space => {
            if (space.occupiedBy.length === 0) {
                spaces.push(space.constructor.name.toLowerCase());
            }
        });

        /// ────────────── refuse visitors that need spawn spots that this room doesn't have
        let possibleVisitors = [];
        inactiveVisitors.forEach(visitor => {
            let ok = true;
            for (let req of visitor.requirements) {
                if (!spaces.includes(req)) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                possibleVisitors.push(visitor);
            }
        });

        /// ────────────── refuse visitors based on combos that cant spawn

        /// ────────────── refuse visitors based on active services

        /// ────────────── priority change
        // spawn frequency (in room)
        possibleVisitors.forEach(visitor => {
            if (this.spawnedVisitors.includes(visitor.name) && visitor.name !== this.favorite) {
                visitor.priority -= _rand(5, 10);
            }
        });

        // spawn frequency (of visitor)
        possibleVisitors.forEach(visitor => {
            if (visitor.spawnCounter >= 4) {
                for (let i = 0; i < visitor.spawnCounter; i++) {
                    visitor.priority -= (i + _rand(1, 7));
                }
            }
            else {
                for (let i = 0; i < visitor.spawnCounter; i++) {
                    visitor.priority += (i + _rand(3, 10));
                }
            }
            if (visitor.priority < 0) {
                visitor.priority = 0;
            }
        });

        /// ────────────── pick visitor with the biggest priority
        if (possibleVisitors.length === 0) {
            return null;
        }

        let picked = possibleVisitors.reduce((prev, curr) => {
            if (prev && prev.priority > curr.priority) {
                return prev;
            }
            else {
                return curr;
            }
        });

        this.spawn(picked);
    }

    /// ────────────────── AI
    AI () {
        /// ────────────── "timers"
        this.ticks++;

        if (this.increase.cur === 0 || this.ticks % 15 === 0) {
            this.increase.cur = _rand(this.increase.min, this.increase.max);
        }
        if (this.threshold.cur === 0 || this.ticks % 20 === 0) {
            this.threshold.cur = _rand(this.threshold.min, this.threshold.max);
        }

        /// ────────────── sleep and sound

        if (this.ticks === this.sleep.lastSleepTick && this.status === "sleeping") {
            this.sleep.lastSleepTick = 0;
            this.status = "active";
        }

        if (this.sound !== 0) {
            this.sound -= 0.5;

            if (this.sound < 0) {
                this.sound = 0;
            }
        }

        /// ────────────── heat increases/decreases

        // failed based increase
        if (this.failed >= 3) {
            this.heat += _rand(5, 10);
            this.threshold.cur -= _rand(3, 5);
        }
        else if (this.failed >= 2) {
            this.heat += _rand(3, 5);
            this.threshold.cur -= _rand(1, 5);
        }
        else if (this.failed >= 1) {
            this.heat += _rand(1, 5);
            this.threshold.cur -= _rand(0, 3);
        }

        // tick based increase
        if (this.ticks % 5 === 0) {
            this.heat += _rand(1, 3);
            console.info(`[${this.name}] bonus 1`);
        }
        if (this.ticks % 7 === 0) {
            this.heat += _rand(1, 3) * _rand(1, 3);
            console.info(`[${this.name}] bonus 2`);
        }

        // normal increase/decrease
        if (this.status !== "active") {
            this.heat -= this.increase.cur;

            if (this.heat < 0) {
                this.heat = 0;
            }
        }
        else {
            this.heat += this.increase.cur;
        }

        /// ────────────── spawn conditions
        if (this.heat >= this.threshold.cur && this.status === "active") {
            if (_rand(1, 10) === 1) {
                this.failed++;
                this.heat = 0;
            }
            else {
                this.heat = 0;
                this.failed = 0;

                let toSpawn = this.spawnSort();
                console.log(toSpawn);
                this.spawn(toSpawn);
            }
        }
        else if (this.status !== "sleeping") {
            // enter sleep randomly
            if (_rand(1, 15) === 1) {
                this.sleep.lastSleepTick = this.ticks + _rand(this.sleep.min, this.sleep.max);
                this.status = "sleeping";
            }
        }

        console.info(
            `AI report from ${this.name}: status: ${this.status} heat: ${this.heat} threshold: ${this.threshold.cur} increase: ${this.increase.cur} tick: ${this.ticks} sound: ${this.sound} failed: ${this.failed}`
        );
    }
}

export class Closet {
    constructor(closetID) {
        this.id = closetID;

        // -- assets & hitboxes
        this.closedImg = new Asset.image();
        this.openImg = new Asset.image();

        this.state = "closed";

        // -- visitor
        this.occupiedBy = [];
    }
}

export let allRooms = new Map();
let _currentRoom;

export function getCurrentRoom() { return _currentRoom; }
export function setCurrentRoom(value) { _currentRoom = value; }

/// --- event listeners
window.addEventListener("visitor movement", (e) => {
    const data = e.detail;
    const visitor = data.visitor;

    // -- remove from previous room
    _removeItem(data.from.occupiedBy, visitor);

    // -- move to new room
    data.to.occupiedBy.push(visitor);
});


window.addEventListener("sound", (e) => {
    const data = e.detail;
    const room = data.room;

    switch (data.cause) {
        case "movement":
            room.sound += 10;
            break;

        case "closet":
            room.sound += 5;
            break;
    }
});
window.addEventListener("visitor spawn", (e) => {
    const data = e.detail;
    let room = allRooms.get(data.to.name);
    let visitor = allVisitors.get(data.visitor.name);

    if (!room || !visitor) {
        console.warn("Couldn’t find room or visitor in maps", room.name, visitor.name);
        return;
    }

    if (data.itemID === 0) {
        visitor.inRoom = room;
        room.occupiedBy.push(visitor);
        visitor.location = "room";
    }
    else {
        for (let i = 0; i < room.items.length; i++) {
            if (room.items[i].constructor.name.toLowerCase() === data.item && data.itemID === room.items[i].id) {
                room.items[i].occupiedBy.push(visitor);
                visitor.inRoom = room;
                visitor.location = room.items[i].constructor.name.toLowerCase();
            }
        }
    }

    console.group("after visitor spawn");
    console.debug("room.occupiedBy:", room.occupiedBy);
    console.debug("allRooms.get():", allRooms.get(data.to.name).occupiedBy);
    console.debug("visitor.inRoom:", visitor.inRoom);
    console.debug("allVisitors.get():", allVisitors.get(data.visitor.name).inRoom);
    console.groupEnd();

    /// trigger movement
    if (visitor.ability.includes("walker")){
        activeIntervals.set(`${visitor.name} moving AI`, new TimeManager().setInterval(visitor.movementAI.bind(visitor), visitor.name === "warlock" ? 500 : 1000));
    }
});