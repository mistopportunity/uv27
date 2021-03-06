"use strict";
function IntroductionRenderer(endCallback) {
    this.endCallback = endCallback;

    this.messages = [
        "the inevitable is here.",
        "the christmas elves have turned.",
        "they've taken the reigns.",
        "but these are no ordinary elves.",
        "these elves murder - kill - maim.",
        "these elves create weapons.",
        "these elves are monsters.",
        "the world needs a hero.",
        "i wish there was any other way...",
        "you know what to do."
    ];
    
    let timeout = null;
    
    this.forcedSizeMode = sizeModes.classic.name;

    this.processClick = () => {
        if(timeout !== null) {
            clearTimeout(timeout);
        }
        this.endCallback();
    }

    this.processKey = key => {
        switch(key) {
            case kc.accept:
            case kc.open:
                if(timeout !== null) {
                    clearTimeout(timeout);
                }
                this.endCallback();
                break;
        }
    }

    this.song = "hero";

    this.fadeIn = 3500;
    this.fadeRange = 0.5;
    this.startTime = null;

    this.start = timestamp => {
        this.startTime = timestamp + 500;
        const timeoutTime = (this.messages.length+1)*this.fadeIn + 13000;
        timeout = setTimeout(endCallback,timeoutTime);
    }

    this.render = timestamp => {

        context.clearRect(0,0,fullWidth,fullHeight);

        const timeDelta = timestamp - this.startTime;
        const progress = timeDelta / this.fadeIn;

        if(progress >= 0) {
            const step = Math.floor(progress);

            let innerProgress = (progress - step) / this.fadeRange;
            if(innerProgress > 1) {
                innerProgress = 1;
            }
    
            let runningYOffset = 100;
            for(let i = 0;i<this.messages.length;i++) {
                if(step >= i) {
                    const textArea = drawTextWhite(this.messages[i],20,runningYOffset,4);
                    if(step === i) {
                        context.fillStyle = `rgba(0,0,0,${1-innerProgress})`;
                        context.fillRect(20,runningYOffset,textArea.width,textArea.height);
                    }
                    runningYOffset += textArea.height + 10;
                }
            }
        }

    }
}
