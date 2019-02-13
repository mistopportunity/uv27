"use strict";
function BonusScreenRenderer(endCallback) {
    this.endCallback = endCallback;
    this.fader = getFader();

    let timeout = null;

    this.processClick = () => {
        if(!this.transitioning) {
            playSound("click.mp3");
            if(timeout !== null) {
                clearTimeout(timeout);
            }
            this.endCallback();
        }
    }

    this.processKey = key => {
        switch(key) {
            case "Enter":
            case "Space":
                if(!this.transitioning) {
                    if(timeout !== null) {
                        clearTimeout(timeout);
                    }
                    this.endCallback();
                }
                break;
        }
    }

    this.start = () => {
        if(!electron) {
            window.location = "https://docs.google.com/forms/d/e/1FAIpQLSdPJ5ANLsmVN0If7DSA8gDJfKuyO73bTmzmjGWBs5yQ4Sy9pA/viewform?usp=sf_link";
        }
        timeout = setTimeout(endCallback,10000);
    }

    this.render = timestamp => {

        context.clearRect(0,0,fullWidth,fullHeight);
        drawTextWhite("death is only the beginning of something new.",15,15,3);

        drawTextWhite("i'll see you around... :)",15,45,3);
        this.fader.render(timestamp);
    }
}
