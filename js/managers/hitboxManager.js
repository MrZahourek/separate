/// --- Hitboxes
// --- imports
import {allRooms, setCurrentRoom, getCurrentRoom} from "./roomManager.js";
import {DOOR_CONNECTIONS, DOOR_COORDINATES, ORIGINAL_SCREEN_SIZE} from "../res/doorData.js";
import {ctx, resizeRedraw} from "./canvasManager.js";
import * as Asset from "./assetManager.js";
import {HITBOX_ORIGINAL_SCREEN, VISITOR_HITBOX_CORDS, VISITOR_IMAGE_DESIRED_SIZE} from "../res/visitorData.js";

// --- variables
const canvas = document.getElementById("main");

// --- classes
class DoorHitbox {
    constructor(doorID) {
        this.id = doorID.toString();

        // --- data for click
        this.leadsTo = DOOR_CONNECTIONS[this.id];
        this.clickAudio = doorID === 12 || doorID === 11 ? new Asset.audio ("audio/stairs.mp3") : new Asset.audio("audio/door.mp3");
    }

    getHitbox() {
        // get scales
        const scaleWidth = canvas.width / ORIGINAL_SCREEN_SIZE.width;
        const scaleHeight = canvas.height / ORIGINAL_SCREEN_SIZE.height;

        // draw hitbox
        let path = new Path2D();

        DOOR_COORDINATES[this.id].map((point, i) => {
            const x = point.x * scaleWidth;
            const y = point.y * scaleHeight;

            i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
        });

        ctx.fillStyle   = "rgba(148,0,211,0.3)";
        ctx.fill(path);

        return path;

    }

    onHitboxClick( currentRoomName ) {
        this.clickAudio.play();
        return currentRoomName === this.leadsTo[0] ? this.leadsTo[1] : this.leadsTo[0];
    }
}

class VisitorHitbox {
    constructor(visitorName) {
        this.visitorName = visitorName;
    }

    getHitbox(offsetX, offsetY) {
        if(!offsetX) { offsetX = 0; }
        if(!offsetY) { offsetY = 0; }

        // draw hitbox
        let path = new Path2D();

        const scaleWidth = canvas.width / HITBOX_ORIGINAL_SCREEN[this.visitorName].width;
        const scaleHeight = canvas.height / HITBOX_ORIGINAL_SCREEN[this.visitorName].height;

        let scale = Math.max((VISITOR_IMAGE_DESIRED_SIZE[this.visitorName].height / HITBOX_ORIGINAL_SCREEN[this.visitorName].height), (VISITOR_IMAGE_DESIRED_SIZE[this.visitorName].width / HITBOX_ORIGINAL_SCREEN[this.visitorName].width));

        VISITOR_HITBOX_CORDS[this.visitorName].map((point, i) => {
            const x = point.x * scaleWidth * scale + offsetX;
            const y = point.y * scaleHeight * scale + offsetY;

            i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
        });

        // ctx.fillStyle   = "rgba(148,0,211,0.3)";
        // ctx.fill(path);
        path.closePath();

        return path;

    }
}

// --- handlers
export function clickHandler(e) {
    // -- get x and y
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    let currentRoom = getCurrentRoom();

    // -- door check
    for (const door of currentRoom.doors) {
        if ( ctx.isPointInPath( door.getHitbox(), x, y ) ) {
            setCurrentRoom( allRooms.get(door.onHitboxClick(currentRoom.name)) );
        }
    }

    resizeRedraw();
}

let hovered = new Set();
let hoverVisitors = new Set(["angel"]);

export function hoverHandler(pos) {
    // -- get x and y
    const x = pos.x;
    const y = pos.y;

    const possibleVisitors = getCurrentRoom().occupiedBy;

    /// --- Visitor hover
    for (const visitor of possibleVisitors) {
        if(hoverVisitors.has(visitor.name) && visitor.hitbox !== null) {
            const inside = ctx.isPointInPath(visitor.hitbox, x, y);

            if (inside && !hovered.has(`visitor: ${visitor.name}`)) {
                hovered.add(`visitor: ${visitor.name}`);
                visitor.onHitboxHover();
            }
            else if (inside && hovered.has(`visitor: ${visitor.name}`)) {
                visitor.onHitboxHover();
            }
            else if (!inside && hovered.has(`visitor: ${visitor.name}`)) {
                hovered.delete(`visitor: ${visitor.name}`);
            }
        }
    }
}

// --- export
export {
    DoorHitbox as door,
    VisitorHitbox as visitor
};