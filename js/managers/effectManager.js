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

export {
    Flashlight as flashlight
};