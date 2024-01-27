export class BackspaceEffect {
    constructor(textToBackspace, framesPerLetter) {
        this.textToBackspace = textToBackspace;
        this.currentIndex = textToBackspace.length;
        this.framesPerLetter = framesPerLetter || 1
        this.frameCount = 0;
    }

    update() {
		if (this.finishedDeleting) {
			Call(this.onFinish)
		}

        if (this.frameCount % this.framesPerLetter === 0) {
            this.currentIndex--;
        }

        this.frameCount++;
    }

    get text() {
        return this.textToBackspace.substring(0, this.currentIndex);
    }

    get finishedDeleting() {
        return this.currentIndex <= 0;
    }
}