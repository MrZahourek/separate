const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

class ImageAsset {
    constructor(src) {
        this.asset = new Image();
        this.src = src;
        this.isLoaded = false;
    }

    load() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded) {
                resolve();
            }

            this.asset.onload = () => {
                this.isLoaded = true;
                resolve();
            }

            this.asset.onerror = () => reject();
            this.asset.src = this.src;
        });
    }

    async draw() {
        try {
            await this.load()
                .then(() => {
                    ctx.drawImage(this.asset, 0, 0, canvas.width, canvas.height);
                });
        }
        catch (err) {
            console.error("Error while loading asset; error: " + err);
        }
    }

    async drawPrecise(offsetX, offsetY, fracW, fracH) {
        try {
            await this.load()
                .then(() => {
                    console.warn("offset: " + offsetX + " " + offsetY);
                    console.warn("canvas: " + canvas.width * 0.05 + " " + canvas.height * 0.05);
                    console.warn("width: " + 1*canvas.width);
                    console.warn("height: " + fracH*canvas.height);
                    console.warn(`drawn at: ${canvas.width * 0.05 + offsetX} ... ${canvas.height * 0.05 + offsetY}`);

                    ctx.drawImage(this.asset, 0,0, this.asset.width, this.asset.height, (canvas.width * 0.05) + offsetX , (canvas.height * 0.05) + offsetY, fracW*canvas.width, fracH*canvas.height);
                });
        }
        catch (err) {
            console.error("Error while precise draw: " + err);
        }
    }
}

class AudioAsset {
    constructor(src) {
        this.audio = new Audio();

        this.src = src;
        this.isLoaded = false;
        this.isLooped = false;
        this.isPlaying = false;
    }

    load() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded) {
                resolve();
            }

            this.audio.oncanplaythrough = () => {
                this.isLoaded = true;
                resolve();
            }

            this.audio.onerror = () => reject();
            this.audio.src = this.src;
        });
    }

    end() {
        if (this.isPlaying) {
            this.audio.pause();

            if (this.isLooped) {
                this.audio.removeEventListener("ended", () =>  this.audio.play() );
                this.isLooped = false;
            }

            this.isPlaying = false;
        }
    }
    async play() {
        if (this.isPlaying) { return; }
        try {
            await this.load().then(() => {
                this.audio.play();
                this.isPlaying = true;
            });

            this.audio.onended =  () => {
                this.isPlaying = false
            };
        }
        catch (err) {
            console.error(`error while loading audio asset: ${err}`);
        }
    }

    async playLooped() {
        if (this.isPlaying) { return; }
        try {
            await this.load().then(() => {
                this.audio.play();
                this.audio.addEventListener("ended", () =>  this.audio.play() );
                this.isLooped = true;
                this.isPlaying = true;
            });
        }
        catch (err) {
            console.error(`error while loading audio asset: ${err}`);
        }
    }
}

export {
    ImageAsset as image,
    AudioAsset as audio
};