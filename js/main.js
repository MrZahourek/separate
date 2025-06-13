/// --- main
// DESCRIPTION:
// used to import managers and start them properly

import {canvas, ctx, resizeRedraw} from "./managers/canvasManager.js";
import {allRooms, Room} from "./managers/roomManager.js";
import {setCurrentRoom, getCurrentRoom} from "./managers/roomManager.js";
import {clickHandler, hoverHandler} from "./managers/hitboxManager.js";
import {allVisitors} from "./managers/visitorManager.js";
import * as Visitor from "./managers/visitorManager.js";

document.addEventListener("DOMContentLoaded", async () => {
    // 1) rooms
    const roomName = new Set(["hall 1", "bathroom", "living room", "kitchen", "hall 2", "office", "master bedroom", "kid bedroom"]);
    for ( let name of roomName ) {
        // set rooms
        allRooms.set( name, new Room(name) );

        // load assets
        await allRooms.get(name).background.load();

        for (let door of allRooms.get(name).doors ) {
            await door.clickAudio.load();
        }
    }

    setCurrentRoom( allRooms.get("office") );
    // 2) visitors
    allVisitors.set("angel", new Visitor.angel())

    allRooms.get("office").occupiedBy.push( allVisitors.get("angel") );


    // 3) canvas setup
    window.addEventListener("resize", resizeRedraw);

    // 4) click handler
    canvas.addEventListener("click", clickHandler);

    // 5) hover handler
    let mousePos = { x: 0, y: 0 };

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    setInterval(() => {
        hoverHandler(mousePos);
    }, 16);

    // finally set up canvas
    resizeRedraw();

});
