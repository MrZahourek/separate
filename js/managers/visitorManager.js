/// --- Visitors


import * as Asset from "./assetManager.js";
import * as Hitbox from "./hitboxManager.js";
import {canvas, ctx, resizeRedraw} from "./canvasManager.js";
import {HITBOX_ORIGINAL_SCREEN, VISITOR_IMAGE_DESIRED_SIZE} from "../res/visitorData.js";
import * as Effect from "./effectManager.js";
import {getCurrentRoom} from "./roomManager.js";

function _rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function _removeItem(array, value) {
    const index = array.indexOf(value);
    if (index > -1) { // only splice array when item is found
        array.splice(index, 1); // 2nd parameter means remove one item only
    }
}

class Angel {
    constructor() {
        this.name = "angel";

        // --- Assets and hitboxes
        this.visitorImg = new Asset.image("images/dither_it_doorman(1).png");
        this.moveAudio = new Asset.audio();
        this.deathAudio = new Asset.audio();
        this.hitboxClass = new Hitbox.visitor("angel");
        this.hitbox = null;

        // --- Mechanics
        this.offsetX = 0;
        this.offsetY = 0;
        this.effect = new Effect.flashlight();
        this.hoveredMS = 0;
        this.hoveredTimes = 0;
    }

    onSpawn() {}

    onDeath() {
        _removeItem(getCurrentRoom().occupiedBy, this);
        this.effect.disable();
        resizeRedraw();
    }

    onSameRoom() {
        this.effect.enable();

        const scaleW = VISITOR_IMAGE_DESIRED_SIZE[this.name].width / HITBOX_ORIGINAL_SCREEN[this.name].width;
        const scaleH = VISITOR_IMAGE_DESIRED_SIZE[this.name].height / HITBOX_ORIGINAL_SCREEN[this.name].height;

        const maxX = canvas.width - (canvas.width * scaleW);
        const maxY = canvas.height - (canvas.height * scaleH);

        this.offsetX = _rand(canvas.width * 0.05, maxX);
        this.offsetY = _rand(canvas.height * 0.05, maxY);
    }

    onHitboxHover() {
        this.hoveredMS++;

        console.log(this.hoveredMS);

        if (this.hoveredMS >= 200) {
            this.hoveredTimes++;
            console.log(this.hoveredTimes);
            if (this.hoveredTimes <= 2) {
                resizeRedraw();
            }
            else {
                this.onDeath();
            }
            this.hoveredMS = 0;
        }
    }

    AI() {}

    movementAI() {}
}

export let allVisitors = new Map();

export {
    Angel as angel
}