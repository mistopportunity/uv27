"use strict";
function SidescrollRenderer(image,endCallback) {

    this.forcedSizeMode = sizeModes.classic.name;

    const spriteWidth = 11;
    const spriteHeight = 24;

    this.frontFacing = {
        x: 0,y:24
    }
    this.backFacing = {
        x: 0,y:0
    }

    const framesPerSecond = 5.5;

    const frameCount = 7;

    const frameDuration = 1000 / framesPerSecond;

    this.rightSprites = [];
    this.leftSprites = [];

    for(let i = 1;i<frameCount;i++) {
        const x = i * spriteWidth;
        const index = i-1;
        this.leftSprites[index] = {
            x:x,y:0
        }
        this.rightSprites[index] = {
            x: x,y:spriteHeight
        }
    }

    const highestFrameIndex = this.leftSprites.length;

    this.elfScale = 20;


    const elfWidth = this.elfScale * spriteWidth;
    const elfHeight = this.elfScale * spriteHeight;
    const halfElfWidth = elfWidth / 2;
    const halfElfHeight = elfHeight / 2;

    const elfX = internalWidth/2-halfElfWidth;
    const elfY = internalHeight/2-halfElfHeight;

    this.animationStartTime = 0;
    this.animationState = "walking-right";

    this.standingLeft = {
        x:spriteWidth,y:spriteHeight
    }
    this.standingRight = {
        x:this.rightSprites[this.rightSprites.length-1].x,y:0
    }

    this.render = timestamp => {
        context.clearRect(0,0,fullWidth,fullHeight);

        let position;
        switch(this.animationState) {
            case "standing-left":
                position = this.standingLeft;
                break;
            case "standing-right":
                position = this.standingRight;
                break;
            case "walking-left":
                position = this.leftSprites[
                    Math.floor((timestamp - this.animationStartTime) / frameDuration) % highestFrameIndex
                ];
                break;
            case "walking-right":
                position = this.rightSprites[
                    Math.floor((timestamp - this.animationStartTime) / frameDuration) % highestFrameIndex
                ];
                break;
            default:
            case "facing-front":
                position = this.frontFacing;
                break;
            case "facing-back":
                position = this.backFacing;
                break;
        }

        context.drawImage(
            image,
            position.x,position.y,spriteWidth,spriteHeight,
            elfX,elfY,elfWidth,elfHeight
        );

        drawLoadingText();
    }
}
