/// --- Visitors


import * as Asset from "./assetManager.js";
import * as Hitbox from "./hitboxManager.js";
import {canvas, ctx, drawCanvas} from "./canvasManager.js";
import {HITBOX_ORIGINAL_SCREEN, VISITOR_IMAGE_DESIRED_SIZE} from "../res/visitorData.js";
import * as Effect from "./effectManager.js";
import {allRooms, getCurrentRoom, setCurrentRoom} from "./roomManager.js";
import {_rand} from "./timeManager.js";

function _removeItem(array, value) {
    const index = array.indexOf(value);
    if (index > -1) { // only splice array when item is found
        array.splice(index, 1); // 2nd parameter means remove one item only
    }
}

class Visitor {
    constructor(visitorName) {
        this.name = visitorName;

        // -- spawn AI
        this.isActive = false;
        this.inactiveTicks = 0;
        this.spawnAI = {cur: _rand(3, 5), min: 3, max: 5};
        this.priority = 0;

        // -- move AI
        this.activeSeconds = 0;
        this.moveAI = {cur: _rand(3, 5), min: 3, max: 5};
        this.fails = 0;
        this.inRoom = null;
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
            `AI report from ${this.name}: inactive ticks: ${this.inactiveTicks} AI: ${this.AIvalue} priority: ${this.priority}`
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
                }
                else {
                    // get the rooms

                    // pick random + weigh based on sound

                    // trigger move method, that triggers onMove method - this way visitors can do their actions when they move but they all move the same
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
        this.moveAudio = new Asset.audio();
        this.effectAudio = new Asset.audio("audio/angel hit.mp3");
        this.deathAudio = new Asset.audio("audio/angel death.mp3");
        this.hitboxClass = new Hitbox.visitor("angel");
        this.hitbox = null;

        // --- Mechanics
        this.offsetX = 0;
        this.offsetY = 0;
        this.effect = new Effect.flashlight();
        this.hoveredMS = 0;
        this.hoveredTimes = 0;

        // -- AI
        this.isActive = true;
    }

    onSpawn() {}

    onMove() {}

    onDeath() {
        this.deathAudio.play();
        this.isActive = false;
        this.effect.disable();
        _removeItem(getCurrentRoom().occupiedBy, this);
        drawCanvas();
    }

    onSameRoom() {
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

        if (this.hoveredMS >= 150) {
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
        this.deathAudio = new Asset.audio();
    }

    onDeath() {}

    onSpawn() {}

    onSameRoom() {
        setCurrentRoom(allRooms.get("death"));
        drawCanvas();
    }
}

class Hunter extends Visitor{
    constructor() {
        super("hunter");
    }

    onSpawn() {}

    onDeath() {}
}

class Hollow extends Visitor{
    constructor() {
        super("hollow");
    }

    onSpawn() {}

    onDeath() {}

    onMove() {}

    onSameRoom() {}

    movementAI() {}
}

class Reanimation extends Visitor{
    constructor() {
        super("reanimation");

        // -- movement and AI

        // -- Sounds

        // -- mechanics
    }

    onSpawn() {}

    onDeath() {}

    onMove() {
        // -- move

        // -- trigger ability
        // get rooms around this one

        // check for player

        // if the player is there play audio

        // if player moves mouse too much kill
    }

    AI() {}

    movementAI() {}
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
    Horde as horde
}