const overlay = document.getElementById("overlay");

class  Flashlight {
    constructor() {
        this.active = false;
    }

    handler(e) {
        overlay.style.setProperty("--Xpos", e.clientX + "px");
        overlay.style.setProperty("--Ypos", e.clientY + "px");
    }

    enable() {
        if (!this.active) {
            overlay.classList.add("flashlight");
            this.active = true;
            document.addEventListener("mousemove", this.handler);
        }
    }

    disable() {
        if (this.active) {
            overlay.classList.remove("flashlight");

            document.removeEventListener("mousemove", this.handler);

            this.active = false;

            overlay.style.removeProperty("--Xpos");
            overlay.style.removeProperty("--Ypos");
        }
    }
}

class HoverName {
    constructor() {
        this.active = false;
    }

    handler(e) {
        document.getElementById("hoverName").style.setProperty("--TextXpos", e.clientX + 10 + "px");
        document.getElementById("hoverName").style.setProperty("--TextYpos", e.clientY + 10 + "px");
    }

    enable( roomName ) {
        if (!this.active) {
            this.active = true;
            document.getElementById("hoverName").innerText = roomName;
            document.addEventListener("mousemove", this.handler);
            document.getElementById("hoverName").classList.remove("hidden");
        }
    }

    disable() {
        if (this.active) {
            document.getElementById("hoverName").classList.add("hidden");

            document.removeEventListener("mousemove", this.handler);

            this.active = false;

            document.getElementById("hoverName").style.removeProperty("--TextXpos");
            document.getElementById("hoverName").style.removeProperty("--TextYpos");
        }
    }
}

export {
    Flashlight as flashlight,
    HoverName as hoverName
};