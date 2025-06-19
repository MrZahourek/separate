/// --- main
// DESCRIPTION:
// used to import managers and start them properly

import {canvas, ctx, drawCanvas} from "./managers/canvasManager.js";
import {allRooms, Room} from "./managers/roomManager.js";
import {setCurrentRoom, getCurrentRoom} from "./managers/roomManager.js";
import {clickHandler, hoverHandler, position, visitor} from "./managers/hitboxManager.js";
import {allVisitors, inactiveVisitors} from "./managers/visitorManager.js";
import * as Visitor from "./managers/visitorManager.js";
import * as Asset from "./managers/assetManager.js";
import {_getTicks, activeIntervals, TimeManager} from "./managers/timeManager.js";
import {ROOMS_AROUND} from "./res/doorData.js";

document.addEventListener("DOMContentLoaded", async () => {

    // 1) visitors
    // declare visitors
    allVisitors.set("angel", new Visitor.angel())
    //allVisitors.set("doorman", new Visitor.doorman());
    //allVisitors.set("hunter", new Visitor.hunter());
    allVisitors.set("hollow", new Visitor.hollow());
    allVisitors.set("horde", new Visitor.horde());
    await allVisitors.set("warlock", new Visitor.warlock());
    allVisitors.set("reanimation", new Visitor.reanimation());

    for (const visitor of allVisitors.values()) {
        await visitor.visitorImg.load()
            .then(() => {
                console.debug(`[${visitor.name}] asset loaded`);
            });

        inactiveVisitors.push(visitor);
        setInterval(() => {visitor.AI.bind(visitor)}, _getTicks(1));
    }

    // 2) rooms
    const roomName = new Set(["hall 1", "bathroom", "living room", "kitchen", "hall 2", "office", "master bedroom", "kid bedroom"]);
    for ( let name of roomName ) {
        // set rooms
        allRooms.set(name, new Room(name));

        // load assets
        await allRooms.get(name).background.load();

        for (let door of allRooms.get(name).doors) {
            await door.clickAudio.load();
        }

        for (let closet of allRooms.get(name).closets) {
            await closet.clickAudio.load();
        }
    }

    for ( let name of roomName ) {
        console.warn(name);
        // get rooms around
        allRooms.get(name).roomsAround = ROOMS_AROUND.get(name).map(name => allRooms.get(name));

        // trigger AI
        activeIntervals.set(`${name} spawn AI`,new TimeManager().setInterval(allRooms.get(name).AI.bind(allRooms.get(name)), _getTicks(1)));
    }

    setCurrentRoom( allRooms.get("office") );


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
