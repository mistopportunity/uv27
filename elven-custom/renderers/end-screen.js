"use strict";
function EndScreenRenderer(endCallback) {

    this.endCallback = endCallback;

    this.textScale = 5;

    this.topText = "thanks for playing";
    this.bottomText = "merry christmas";

    this.textMargin = 15;

    const topTextTestResult = drawTextTest(
        this.topText,this.textScale
    );
    const bottomTextTestResult = drawTextTest(
        this.bottomText,this.textScale
    );

    this.bottomTextX = Math.round(halfWidth - (bottomTextTestResult.width / 2));
    this.topTextX = Math.round(halfWidth - (topTextTestResult.width / 2));

    this.bottomTextY = fullHeight - this.textMargin - bottomTextTestResult.height;
    this.topTextY = this.textMargin;

    this.forcedSizeMode = sizeModes.classic.name;

    this.processClick = () => {
        playSound("click.mp3");
        this.endCallback();
    }

    this.processKey = key => {
        switch(key) {
            case kc.accept:
            case kc.open:
                this.endCallback();
                break;
        }
    }

    this.render = timestamp => {

        context.clearRect(0,0,fullWidth,fullHeight);

        context.drawImage(
            imageDictionary["end-screen"],
            0,0,fullWidth,fullHeight
        );

        drawTextWhite(
            this.topText,
            this.topTextX,this.topTextY,
            this.textScale,1
        );
        drawTextWhite(
            this.bottomText,
            this.bottomTextX,this.bottomTextY,
            this.textScale,1
        );

    }


}
