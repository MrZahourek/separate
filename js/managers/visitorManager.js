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
import {allRooms, getCurrentRoom, setCurrentRoom} from "./roomManager.js";
import {_rand, _removeItem, TimeManager} from "./timeManager.js";
import {position} from "./hitboxManager.js";

export let activeVisitors = [];
export let inactiveVisitors = [];

class Visitor {
    constructor(visitorName) {
        this.name = visitorName;

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
                console.debug(`[${this.name}] is about to move from ${this.inRoom}`);
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

                    for (let i = 0; i < possibleRooms.length; i++) {
                        if (allRooms.get(possibleRooms[i]).occupiedBy.includes(allVisitors.get("doorman")) || allRooms.get(possibleRooms[i]).occupiedBy.includes(allVisitors.get("hunter"))) { break; }

                        rooms.push(allRooms.get(possibleRooms[i]));
                        weights.push(allRooms.get(possibleRooms[i]).sound);

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
        }, 6000);
    }

    onSameRoom() {
        this._startKillTimer();
        this.effect.enable();

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

        console.debug("[angel] hovered ms: " + this.hoveredMS);

        if (this.hoveredMS >= 15) {
            this.hoveredTimes++;

            if (this.hoveredTimes <= 2) {
                this.effectAudio.audio.volume = 0.25;
                this.effectAudio.play();
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
        this.deathAudio.audio.volume = 0.33;
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

        this.moveAudio = new Asset.audio("audio/hollow move.mp3");
        this.deathAudio = new Asset.audio("audio/hollow death.mp3");

        this.visitorImg = new Asset.image("images/hollow.png");
    }

    onSpawn() {
        new TimeManager().setTimeout(this.despawn.bind(this), 120000);
    }

    onDeath() {
        this.deathAudio.play();
    }

    onMove() {
        this.moveAudio.play();
    }

    onSameRoom() {
        new TimeManager().setTimeout(() => {
            if (this.inRoom === getCurrentRoom()) { this.kill() }
        }, 5000);
    }

    movementAI() {}
}

class Reanimation extends Visitor {
    constructor() {
        super("reanimation");

        // -- movement and AI

        // -- Sounds

        // -- mechanics
    }

    onSpawn() {}

    onDeath() {}

    onMove() {
        // get rooms around this one
        const rooms = this.inRoom.roomsAround;

        // check for player
        if (rooms.includes(getCurrentRoom())) {
            const original = {x: position.x, y: position.y};
            new TimeManager().setInterval(() => {

            })
        }
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
    }

}

export let allVisitors = new Map();

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