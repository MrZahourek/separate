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
                    let hRatio = canvas.width  / this.asset.width    ;
                    let vRatio =  canvas.height / this.asset.height  ;
                    let ratio  = Math.min ( hRatio, vRatio );

                    ctx.drawImage(this.asset, 0,0, this.asset.width, this.asset.height, offsetX , offsetY, fracW*canvas.width, fracH*canvas.height);
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

    end() {}
    async play() {
        try {
            await this.load().then(() => {this.audio.play();});
        }
        catch (err) {
            console.error(`error while loading audio asset: ${err}`);
        }
    }

    playLooped() {}
}

export {
    ImageAsset as image,
    AudioAsset as audio
};