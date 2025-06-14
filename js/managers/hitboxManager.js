/// --- Hitboxes
// --- imports
import {allRooms, setCurrentRoom, getCurrentRoom} from "./roomManager.js";
import {DOOR_CONNECTIONS, DOOR_COORDINATES, ORIGINAL_SCREEN_SIZE} from "../res/doorData.js";
import {ctx, drawCanvas} from "./canvasManager.js";
import * as Asset from "./assetManager.js";
import {HITBOX_ORIGINAL_SCREEN, VISITOR_HITBOX_CORDS, VISITOR_IMAGE_DESIRED_SIZE} from "../res/visitorData.js";
import * as Effect from "./effectManager.js";
import {allVisitors} from "./visitorManager.js";

// --- variables
const canvas = document.getElementById("main");

// --- classes
class DoorHitbox {
    constructor(doorID) {
        this.id = doorID.toString();

        // --- data for click
        this.leadsTo = DOOR_CONNECTIONS[this.id];
        this.clickAudio = doorID === 12 || doorID === 11 ? new Asset.audio ("audio/stairs.mp3") : new Asset.audio("audio/door.mp3");

        // --- hitbox
        this.hitbox = this.getHitbox();
        this.effect = new Effect.hoverName();
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

    onHitboxHover( currentRoomName ) {
        const room = allRooms.get( currentRoomName === this.leadsTo[0] ? this.leadsTo[1] : this.leadsTo[0] );

        console.log(room.occupiedBy);

        console.log()

        if ( room.occupiedBy.includes( allVisitors.get("doorman")) )  {
            allVisitors.get("doorman").effectAudio.audio.volume = 0.15;
            allVisitors.get("doorman").effectAudio.playLooped();
        }
        this.effect.enable( room.name );
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

class ClosetHitbox {
    constructor(closetID) {
        this.id = closetID.toString();

        // --- state
        this.state = "closed";

        // --- assets
        this.clickAudio = null;
    }
}

// --- handlers
export let position = { x: 0, y: 0};
export function clickHandler(e) {
    // -- get x and y
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    let currentRoom = getCurrentRoom();

    // -- door check
    for (const door of currentRoom.doors) {
        if ( ctx.isPointInPath( door.getHitbox(), x, y ) ) {
            door.effect.disable();

            setCurrentRoom( allRooms.get(door.onHitboxClick(currentRoom.name)) );
            for (const visitor of getCurrentRoom().occupiedBy) {
                try {
                    visitor.onSameRoom();
                }
                catch (err) {
                    console.log("");
                }
            }
        }
    }

    drawCanvas();
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

    /// --- Door hover
    for (const door of getCurrentRoom().doors) {
        const inside = ctx.isPointInPath(door.hitbox, x, y);

        //console.log(JSON.stringify(door) + " " + JSON.stringify(hovered) + " " + inside);

        if (inside && !hovered.has(`door: ${door.id}`)) {
            hovered.add(`door: ${door.id}`);
            door.onHitboxHover( getCurrentRoom().name );
            console.log("entered hitbox of " + JSON.stringify(door));
        }
        else if (inside && hovered.has(`door: ${door.id}`)) {
            door.onHitboxHover( getCurrentRoom().name );
            console.log("inside hitbox of " + JSON.stringify(door));
        }
        else if (!inside && hovered.has(`door: ${door.id}`)) {
            hovered.delete(`door: ${door.id}`);
            console.log("exited hitbox of " + JSON.stringify(door));
            door.effect.disable();
            if ( allRooms.get( getCurrentRoom().name === door.leadsTo[0] ? door.leadsTo[1] : door.leadsTo[0] ).occupiedBy.includes( allVisitors.get("doorman" )) ) {
                allVisitors.get("doorman").effectAudio.end();
            }
        }
    }
}

// --- export
export {
    DoorHitbox as door,
    VisitorHitbox as visitor,
    ClosetHitbox as closet
};