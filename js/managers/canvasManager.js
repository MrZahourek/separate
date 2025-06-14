/// --- Canvas manager
// -- imports
import {getCurrentRoom} from "./roomManager.js";
import * as Asset from "./assetManager.js";
import * as Visitor from "./visitorManager.js";
import {HITBOX_ORIGINAL_SCREEN, VISITOR_IMAGE_DESIRED_SIZE} from "../res/visitorData.js";

// --- variables


export const canvas = document.getElementById("main");
export const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export async function drawCanvas() {
    // clear only the visible world rect
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw background
    await getCurrentRoom().background.draw();

    // draw visitors
    for (const visitor of getCurrentRoom().occupiedBy) {
        visitor.onSameRoom();

        const size = VISITOR_IMAGE_DESIRED_SIZE[visitor.name];
        const scaleW = size.width / HITBOX_ORIGINAL_SCREEN[visitor.name].width;
        const scaleH = size.height / HITBOX_ORIGINAL_SCREEN[visitor.name].height;

        console.log(size + " " + scaleW + " " + scaleH);

        await visitor.visitorImg.drawPrecise(visitor.offsetX, visitor.offsetY, scaleW, scaleH);

        visitor.hitbox = visitor.hitboxClass.getHitbox(visitor.offsetX, visitor.offsetY);
    }

    // draw objects

}
