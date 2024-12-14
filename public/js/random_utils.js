class WebRandom {
    constructor() {
        this.crypto = window.crypto || window.msCrypto;
    }

    // Generate a random float between min and max
    randomFloat(min, max) {
        const randomBuffer = new Uint32Array(1);
        this.crypto.getRandomValues(randomBuffer);
        const randomNumber = randomBuffer[0] / (0xffffffff + 1);
        return min + randomNumber * (max - min);
    }

    // Generate a random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(this.randomFloat(min, max + 1));
    }
}

export const webRandom = new WebRandom();
