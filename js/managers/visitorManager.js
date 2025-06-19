/// --- Visitors
import * as Asset from "./assetManager.js";
import * as Hitbox from "./hitboxManager.js";
import {canvas, drawCanvas} from "./canvasManager.js";
import {
    HITBOX_ORIGINAL_SCREEN, VISITOR_ABILITIES,
    VISITOR_IMAGE_DESIRED_SIZE,
    VISITOR_SPAWN_PLACES,
    VISITORS_REQUIREMENTS
} from "../res/visitorData.js";
import * as Effect from "./effectManager.js";
import {allRooms, getCurrentRoom} from "./roomManager.js";
import {_between, _rand, _removeItem, TimeManager} from "./timeManager.js";
import {position} from "./hitboxManager.js";

export let activeVisitors = [];
export let inactiveVisitors = [];

class Visitor {
    constructor(visitorName) {
        this.name = visitorName;

        this.offsetX = 0;
        this.offsetY = 0;
        this.visitorImg = new Asset.image(`images/${visitorName}.png`);

        // -- spawn AI
        this.isActive = false;
        this.inactiveTicks = 0;
        this.spawnAI = {cur: _rand(3, 5), min: 3, max: 5};
        this.priority = 0;
        this.requirements = VISITORS_REQUIREMENTS.get(visitorName);
        this.spawnPlaces = VISITOR_SPAWN_PLACES.get(visitorName);
        this.spawnCounter = 0;
        this.ability = VISITOR_ABILITIES.get(visitorName);

        // -- move AI
        this.activeSeconds = 0;
        this.moveAI = {cur: _rand(3, 5), min: 3, max: 5};
        this.fails = 0;
        this.inRoom = null;
        this.location = null;
    }

    onMove() {}

    onSpawn() {}

    onDeath() {}

    onSameRoom() {}

    move(toRoom) {
        // inform about movement
        // inform rooms
        window.dispatchEvent(
            new CustomEvent("visitor movement", {
                detail: {
                    from: this.inRoom,
                    to: toRoom,
                    visitor: this
                }
            }),
        );

        // update sound
        window.dispatchEvent(
            new CustomEvent("sound", {
                detail: {
                    room: toRoom,
                    cause: "movement"
                }
            }),
        );

        // change room
        this.inRoom = toRoom;

        // trigger onMove
        this.onMove();

    }

    despawn() {
        this.isActive = false;
        _removeItem(activeVisitors, this);
        _removeItem(allRooms.get(this.inRoom.name).occupiedBy, this);
        inactiveVisitors.push(this);
        console.warn(`${this.name} just died`);
        this.onDeath();
    }

    kill() {
        document.cookie = `visitor=${this.name}`;

        window.location.href = "death.php";
    }

    spawn(inRoom) {
        this.inRoom = inRoom;
        this.onSpawn();
    }

    AI() {
        if (!this.isActive) {
            this.inactiveTicks++;
            this.priority = this.inactiveTicks + (this.spawnAI.cur * 3);
            if (this.inactiveTicks % 15 === 0) {
                this.spawnAI.cur += _rand(this.spawnAI.min, this.spawnAI.max);
            }
        }
        else {
            this.priority = 0;
            this.inactiveTicks = 0;
        }

        console.info(
            `AI report from ${this.name}: inactive ticks: ${this.inactiveTicks} AI: ${this.spawnAI.cur} priority: ${this.priority}`
        );
    }

    movementAI() {
        if (this.isActive) {
            this.activeSeconds++;

            if (this.activeSeconds > (10 - this.moveAI.cur) + _rand(0, 15) - this.fails) {
                // pick possible rooms
                const possibleRooms = this.inRoom.roomsAround;
                const pickedIndex = _rand(0, possibleRooms.length);

                if (pickedIndex === possibleRooms.length) {
                    this.fails++;

                    // fail bonus
                    if (this.fails >= 3) {
                        this.moveAI.min += 2;
                        this.moveAI.max += 2;
                        this.moveAI.cur = _rand(this.moveAI.min, this.moveAI.max);
                    }
                }
                else {
                    // get the rooms
                    let rooms = [];
                    let weights = [];

                    console.warn(possibleRooms);

                    if (rooms.length !== weights.length) {
                        console.error("rooms vs weights length mismatch", rooms, weights);
                    }


                    for (let i = 0; i < possibleRooms.length; i++) {
                        if (possibleRooms[i] === undefined) { continue; }

                        const doorman   = allVisitors.get("doorman");
                        const hunter    = allVisitors.get("hunter");
                        const occupied  = possibleRooms[i].occupiedBy || [];

                        if (doorman && occupied.includes(doorman) || hunter  && occupied.includes(hunter)) { continue; }
                        rooms.push(allRooms.get(possibleRooms[i].name));
                        weights.push(allRooms.get(possibleRooms[i].name).sound);

                        if (pickedIndex === i) {
                            weights[i] += 15;
                        }
                    }

                    // pick random + weigh based on sound
                    let sum = weights.reduce((previousValue, currentValue) => previousValue + currentValue, 0); // this gets total value of the sounds
                    const roll = Math.floor(Math.random() * sum); // get a random value from the range of total sound

                    for(let i = 0; i < rooms.length; i++) {
                        sum -= weights[i];
                        // since we decrease sum by the amount of sound in that room
                        // the chance for the room with the biggest sound to get picked is the biggest
                        // since the more numbers that can be generated are in that range (if sound is 5 then 5 numbers can be the room pick, if its 15 its more likely)
                        // basically its 1 in sound chance for the room to not get picked
                        if (roll >= sum) {
                            // trigger move method, that triggers onMove method - this way visitors can do their actions when they move but they all move the same
                            this.move(rooms[i]);
                            break; // exit for loop
                        }
                    }

                    // reset values
                    this.fails = 0;
                    this.moveAI.min = 3;
                    this.moveAI.max = 5;
                    this.moveAI.cur = _rand(this.moveAI.min, this.moveAI.max);
                }

                this.activeSeconds = 0;
            }
        }
    }
}

class Angel extends Visitor{
    constructor() {
        super("angel");

        // --- Assets and hitboxes
        this.visitorImg = new Asset.image("images/angel.png");
        this.moveAudio = new Asset.audio("audio/angel move.mp3");
        this.effectAudio = new Asset.audio("audio/angel hit.mp3");
        this.deathAudio = new Asset.audio("audio/angel death.mp3");
        this.spawnAudio = new Asset.audio("audio/angel spawn.mp3");
        this.hitboxClass = new Hitbox.visitor("angel");
        this.hitbox = null;

        // --- Mechanics
        this.offsetX = 0;
        this.offsetY = 0;
        this.effect = new Effect.flashlight();
        this.hoveredMS = 0;
        this.hoveredTimes = 0;
        this.killTimer = null;

        // -- AI
        this.isActive = true;
    }

    onSpawn() {
        this.spawnAudio.play();
    }

    onMove() {
        this.moveAudio.play();

        if (this.killTimer) { clearTimeout(this.killTimer); }
        drawCanvas();
    }

    onDeath() {
        clearTimeout(this.killTimer);
        this.killTimer = null;

        this.deathAudio.play();
        this.isActive = false;
        this.effect.disable();

        _removeItem(getCurrentRoom().occupiedBy, this);
        drawCanvas();
    }

    _startKillTimer() {
        if (this.killTimer) { clearTimeout(this.killTimer); }

        this.killTimer = setTimeout(() => {
            this.kill();
        }, 10000);
    }

    onSameRoom() {
        this._startKillTimer();
        //this.effect.enable();

        this.isActive = true;

        const scaleW = VISITOR_IMAGE_DESIRED_SIZE[this.name].width / HITBOX_ORIGINAL_SCREEN[this.name].width;
        const scaleH = VISITOR_IMAGE_DESIRED_SIZE[this.name].height / HITBOX_ORIGINAL_SCREEN[this.name].height;

        const maxX = canvas.width - (canvas.width * scaleW);
        const maxY = canvas.height - (canvas.height * scaleH);

        this.offsetX = _rand(canvas.width * 0.05, maxX);
        this.offsetY = _rand(canvas.height * 0.05, maxY);
    }

    onHitboxHover() {
        this.hoveredMS++;
        this.activeSeconds = 0;

        console.debug("[angel] hovered ms: " + this.hoveredMS);

        if (this.hoveredMS >= 250) {
            this.hoveredTimes++;

            if (this.hoveredTimes <= 2) {
                this.effectAudio.audio.volume = 0.25;
                this.effectAudio.play();
                this.onSameRoom();
                drawCanvas();
            }
            else {
                this.onDeath();
            }
            this.hoveredMS = 0;
        }
    }
}

class JesterClone {
    constructor() {}

    onSpawn() {}
}
class Jester extends Visitor{
    constructor() {
        super("jester");

        // --- Assets & Hitboxes
    }

    onSpawn() {}
}

class Doorman extends Visitor{
    constructor() {
        super("doorman");
        this.name = "doorman";

        // -- Assets
        this.effectAudio = new Asset.audio("audio/doorman effect.mp3");
        this.deathAudio = new Asset.audio("audio/doorman death.mp3");
        this.deathTimeout = null;
    }

    despawn() {
        this.isActive = false;
        _removeItem(activeVisitors, this);
        allRooms.get(this.inRoom.name).status = "active";
        _removeItem(allRooms.get(this.inRoom.name).occupiedBy, this);
        inactiveVisitors.push(this);
        console.warn(`${this.name} just died`);
        this.onDeath();
    }

    onDeath() {
        this.deathAudio.audio.volume = 0.03;
        this.deathAudio.play();
    }

    onSpawn() {
        this.deathTimeout = new TimeManager().setTimeout(this.despawn.bind(this), 60000);
    }

    onSameRoom() {
        this.kill();
    }
}

class Hunter extends Visitor{
    constructor() {
        super("hunter");

        // -- audio
        this.spawnAudio = new Asset.audio("audio/hunter spawn.mp3");
        this.deathAudio = new Asset.audio("audio/hunter death.mp3")
    }

    onSpawn() {
        const roomAudio = new Asset.audio(`audio/hunter ${this.inRoom.name}.mp3`);
        roomAudio.audio.volume = 0.15;
        new TimeManager().setTimeout(this.despawn.bind(this), 60000);
        this.spawnAudio.play();
        roomAudio.play();
    }

    onDeath() {
        this.deathAudio.play();
    }

    onSameRoom() {
        this.kill();
    }
}

class Hollow extends Visitor{
    constructor() {
        super("hollow");

        this.offsetX = 400;
        this.offsetY = 250;

        this.moveAudio = new Asset.audio("audio/hollow move.mp3");
        this.deathAudio = new Asset.audio("audio/hollow death.mp3");
        this.visitorImg = new Asset.image("images/hollow.png");

        this.killTimer = null;
    }

    onSpawn() {
        new TimeManager().setTimeout(this.despawn.bind(this), 120000);
    }

    onDeath() {
        this.deathAudio.play();
    }

    onMove() {
        this.moveAudio.play();
        this.killTimer = null;
        drawCanvas();
    }

    _startKillTimer() {
        if (this.killTimer) { clearTimeout(this.killTimer); }

        this.killTimer = setTimeout(() => {
            if (getCurrentRoom() === this.inRoom) {
                this.kill();
            }
        }, 3000);
    }

    onSameRoom() {
       this._startKillTimer();
    }

    movementAI() {
        if (this.isActive) {
            this.activeSeconds++;

            if (this.activeSeconds > (10 - this.moveAI.cur) + _rand(0, 15) - this.fails) {
                // pick possible rooms
                const possibleRooms = this.inRoom.roomsAround;
                const pickedIndex = _rand(0, possibleRooms.length);

                if (pickedIndex === possibleRooms.length) {
                    this.fails++;

                    // fail bonus
                    if (this.fails >= 3) {
                        this.moveAI.min += 2;
                        this.moveAI.max += 2;
                        this.moveAI.cur = _rand(this.moveAI.min, this.moveAI.max);
                    }
                }
                else {

                    let max = possibleRooms[0];

                    for (let i = 0; i < possibleRooms.length; i++) {
                        if (possibleRooms[i] === undefined) { continue; }

                        const doorman   = allVisitors.get("doorman");
                        const hunter    = allVisitors.get("hunter");
                        const occupied  = possibleRooms[i].occupiedBy || [];

                        if (doorman && occupied.includes(doorman) || hunter  && occupied.includes(hunter)) { continue; }


                        if (max.sound < possibleRooms[i].sound) {
                            max = possibleRooms;
                        }
                    }

                    if (max === undefined) {
                        this.activeSeconds = 0;
                        return;
                    }

                    console.warn(`picked room = ${max.name}`);

                    this.move(max);

                    this.fails = 0;
                    this.moveAI.min = 3;
                    this.moveAI.max = 5;
                    this.moveAI.cur = _rand(this.moveAI.min, this.moveAI.max);
                }

                this.activeSeconds = 0;
            }
        }
    }
}

class Reanimation extends Visitor {
    constructor() {
        super("reanimation");

        // -- Sounds
        this.effectAudio = new Asset.audio("audio/reanimation effect.mp3");
        this.deathAudio = new Asset.audio("audio/reanimation death.mp3");
        this.moveAudio = new Asset.audio("audio/reanimation move.mp3");
    }

    onSpawn() {
        new TimeManager().setTimeout(this.despawn.bind(this), 120000);
    }

    onDeath() {
        this.deathAudio.play();
    }

    onMove() {
        // get rooms around this one
        const rooms = this.inRoom.roomsAround;

        // check for player
        if (rooms.includes(getCurrentRoom())) {
            this.effectAudio.play();
            const original = {x: position.x, y: position.y};
            new TimeManager().setInterval(() => {
                // --- check how much the cursor moved and if it moved too much kill
                if (!_between(position.x, original.x - 150, original.x + 150)) { this.kill(); }

                if (!_between(position.y, original.y - 150, original.y + 150)) { this.kill(); }
            }, 1000, { maxRuns: 6 });
        }

        drawCanvas();
    }

}
class HordeHeart {
    constructor() {}

    onSpawn() {}

    onDeath() {}

    onHitboxClick() {}
}

class Horde extends Visitor{
    constructor() {
        super("horde");
    }

    onSpawn() {}

    onDeath() {}
}
class SeelieStone {}
class Warlock extends Visitor {
    constructor() {
        super("warlock");

        // -- Assets
        this.visitorImg = new Asset.image("images/warlock.png");
    }

}

export let allVisitors = new Map();

window.addEventListener("visitor death", e => {
    const { visitor } = e.detail;
    visitor.despawn();
    // then force a full redraw:
    drawCanvas();
});

export {
    Angel as angel,
    Jester as jester,
    JesterClone as jesterClone,
    Doorman as doorman,
    Hunter as hunter,
    Hollow as hollow,
    Reanimation as reanimation,
    HordeHeart as heart,
    Horde as horde,
    Warlock as warlock,
    SeelieStone as stone
}