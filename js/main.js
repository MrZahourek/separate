/// --- main
// DESCRIPTION:
// used to import managers and start them properly

import {canvas, ctx, drawCanvas} from "./managers/canvasManager.js";
import {allRooms, Room} from "./managers/roomManager.js";
import {setCurrentRoom, getCurrentRoom} from "./managers/roomManager.js";
import {clickHandler, hoverHandler, position} from "./managers/hitboxManager.js";
import {allVisitors} from "./managers/visitorManager.js";
import * as Visitor from "./managers/visitorManager.js";
import * as Asset from "./managers/assetManager.js";

document.addEventListener("DOMContentLoaded", async () => {
    // 1) rooms
    const roomName = new Set(["hall 1", "bathroom", "living room", "kitchen", "hall 2", "office", "master bedroom", "kid bedroom", "death"]);
    for ( let name of roomName ) {
        // set rooms
        allRooms.set(name, new Room(name));

        // load assets
        await allRooms.get(name).background.load();

        for (let door of allRooms.get(name).doors) {
            await door.clickAudio.load();
        }
    }

    setCurrentRoom( allRooms.get("office") );
    // 2) visitors
    allVisitors.set("angel", new Visitor.angel())
    allVisitors.set("doorman", new Visitor.doorman());

    allRooms.get("kitchen").occupiedBy.push( allVisitors.get("angel") );
    allRooms.get("hall 1").occupiedBy.push( allVisitors.get("doorman") );


    // 3) canvas setup
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        drawCanvas();
    });

    // 4) click handler
    canvas.addEventListener("click", clickHandler);

    // 5) hover handler
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        position.x = e.clientX - rect.left;
        position.y = e.clientY - rect.top;
    });

    setInterval(() => {
        hoverHandler(position);
    }, 16);

    const backgroundMusic = new Asset.audio("audio/background.mp3");
    const test = new Asset.audio("audio/doorman effect.mp3");
    canvas.addEventListener("click", () => {
        backgroundMusic.audio.volume = 0.5;
        backgroundMusic.playLooped();
    }, { once: true});

    // finally set up canvas
    drawCanvas();

});
