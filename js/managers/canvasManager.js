/// --- Canvas manager
// -- imports
import {getCurrentRoom} from "./roomManager.js";
import {HITBOX_ORIGINAL_SCREEN, VISITOR_IMAGE_DESIRED_SIZE} from "../res/visitorData.js";
import {CLOSET_DESIRED_SIZE} from "../res/doorData.js";

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
        const size = VISITOR_IMAGE_DESIRED_SIZE[visitor.name];
        const scaleW = size.width / HITBOX_ORIGINAL_SCREEN[visitor.name].width;
        const scaleH = size.height / HITBOX_ORIGINAL_SCREEN[visitor.name].height;

        console.log(size + " " + scaleW + " " + scaleH);

        await visitor.visitorImg.drawPrecise(visitor.offsetX, visitor.offsetY, scaleW, scaleH);
        if (visitor.hitboxClass) {
            visitor.hitbox = visitor.hitboxClass.getHitbox(visitor.offsetX, visitor.offsetY);
        }
    }

    // draw objects
    for (const item of getCurrentRoom().items) {
        if (item.constructor.name === "Closet") {
            const size = CLOSET_DESIRED_SIZE[item.id.toString()][item.state];
            const scaleW = size.width / HITBOX_ORIGINAL_SCREEN["closet"].width;
            const scaleH = size.height / HITBOX_ORIGINAL_SCREEN["closet"].height;

            if (item.state === "open") {
                await item.openImg.drawPrecise(item.offsetX, item.offsetY, scaleW, scaleH);
            }
            else {
                await item.closedImg.drawPrecise(item.offsetX, item.offsetY, scaleW, scaleH);
            }
        }
    }

}
