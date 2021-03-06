"use strict";
function ElfScreenRenderer(winCallback,loseCallback,elfID,isBoss) {

    this.elf = elves[elfID];

    let backgroundCycleTime;

    if(this.elf.backgroundCycleTime) {
        backgroundCycleTime = this.elf.backgroundCycleTime;
    } else if(isBoss) {
        backgroundCycleTime = 10000;
    }

    if(this.elf.song) {
        this.song = this.elf.song;
    }

    if(this.elf.songIntro) {
        this.songIntro = this.elf.songIntro;
    }

    this.musicOptional = true;

    this.elfHeight = 372;
    this.elfWidth = Math.round((elfSourceWidth / elfSourceHeight) * this.elfHeight);

    this.elfCenterX = Math.round(halfWidth - (this.elfWidth / 2));
    this.background = !isBoss ? new Background(this.elf.background,this.elf.backgroundColor,backgroundCycleTime) : new BossBackground(backgroundCycleTime);
    this.elfX = this.elfCenterX;

    this.elfMoveStart = null;
    this.elfMoveDuration = null;
    this.elfMoveStartTime = null;
    this.elfMoveDistance = null;

    this.moveElf = (duration,newXPercent) => {
        this.elfMoveDuration = duration;
        this.elfMoveStart = this.elfX;
        let elfMoveEnd = Math.floor((newXPercent * fullWidth) - (this.elfWidth / 2));

        this.elfMoveDistance = elfMoveEnd - this.elfMoveStart;

        this.elfMoveStartTime = performance.now();
    }

    this.winCallback = winCallback;
    this.loseCallback = loseCallback;

    this.playerInputs = null;
    this.playerInputsEnabled = false;

    this.playerInputsWidth = Math.round(fullWidth * 0.5);
    this.playerInputsX = Math.round(halfWidth - (this.playerInputsWidth / 2));

    let runningYValue = 394;
    const textMargin = 10;
    const inputBoxMargin = 10;

    this.playerInputsTextX = this.playerInputsX + textMargin;
    this.playerInputsHeight = 50;
    this.playerInputTextScale = 4;

    this.playerInputsYValues = [];

    this.playerInputDisableStartTime = null;
    this.playerInputEnableStartTime = null;
    this.hoverEffectIndex = null;

    this.playerInputToggleAnimationTime = 200;
    this.playerInputToggleDistance = fullWidth;

    this.startInputText = null;

    this.hoverEffectSize = 3;
    this.hoverEffectX = this.playerInputsX - this.hoverEffectSize;
    this.doubleHoverSize = this.hoverEffectSize + this.hoverEffectSize;
    this.hoverEffectHeight = this.playerInputsHeight + this.doubleHoverSize;
    this.hoverEffectWidth = this.playerInputsWidth + this.doubleHoverSize;

    const healthBarMargin = 15;

    this.healthBarWidth = !isBoss ? 250 : fullWidth - (healthBarMargin * 2);
    this.healthBarHeight = 24;
    const healthBarTop = 0;
    const healthBarTextMargin = 8;
    this.healthBarTextSize = 3.5
    
    const healthBarTextY = healthBarTop + this.healthBarHeight + healthBarMargin + healthBarTextMargin;
    
    const healthBarY = healthBarTop + healthBarMargin;

    this.leftHealthBar = {
        x: Math.floor(healthBarMargin),
        y: !isBoss ? healthBarY : 75,
        textY: !isBoss ? healthBarTextY : 75 + this.healthBarHeight + healthBarTextMargin,
        foregroundColor: "white",
        backgroundColor: "rgb(0,0,0)"
    };

    this.rightHealthBar = {
        y: healthBarY,
        x: Math.floor(!isBoss ? fullWidth - healthBarMargin - this.healthBarWidth : healthBarMargin),
        textY: healthBarTextY,
        foregroundColor: this.elf.foregroundColor ? this.elf.foregroundColor : this.elf.backgroundColor,
        backgroundColor: "rgb(0,0,0)"
    };

    this.bottomMessageWidth = fullWidth;
    this.bottomMessageHeight = 40;
    this.bottomMessageX = 0;
    this.bottomMessageY = 332;

    this.subTextScale = 2.5;
    this.subTextMargin = 20;

    const healthBarTextHeight = drawTextTest("",this.healthBarTextSize).height;

    this.subTextY = Math.floor((healthBarTextY + healthBarTextHeight + healthBarTextMargin) +
        Math.floor(Math.round(healthBarTextHeight/2)-(drawTextTest("",this.subTextScale).height/2)));

    this.bottomMessageTextScale = 4;

    const textDrawTestResult = drawTextTest("",this.bottomMessageTextScale);

    this.bottomMessageTextY = this.bottomMessageY + Math.floor((this.bottomMessageHeight / 2) - (textDrawTestResult.height / 2));

    this.firstInputMask = null;

    this.elfTextBubbleWidth = !isBoss ? 400 : 450;
    this.elfTextBubbleHeight = 220;
    this.elfTextBubbleX = !isBoss ? 270 : Math.round(halfWidth - (this.elfTextBubbleWidth / 2));
    this.elfTextBubbleY = 82;

    if(isBoss) {
        this.elfTextBubbleY += 23;
    }

    this.disablePlayerInputs = () => {
        if(this.playerInputDisableStartTime !== null) {
            console.error("Error: Player inputs are already enabled");
            return;
        }
        
        this.playerInputEnableStartTime = null;

        this.startInputText = this.playerInputs[0].name;
        this.firstInputMask = "skip";

        this.playerInputDisableStartTime = performance.now();
        this.playerInputsEnabled = false;

    }

    this.enablePlayerInputs = () => {
        if(this.playerInputDisableStartTime !== null) {
            this.playerInputDisableStartTime = null;
            this.firstInputMask = null;
            this.startInputText = null;
            this.playerInputEnableStartTime = performance.now();
        }
        if(this.hoverEffectIndex > this.playerInputs.length-1 && this.lastEventWasKeyBased) {
            this.hoverEffectIndex = 0;
        }
        this.playerInputsEnabled = true;
    }

    for(let i = 0;i<4;i++) {
        this.playerInputsYValues[i] = {
            value: runningYValue,
            textValue: runningYValue + textMargin,
            hoverValue: runningYValue - this.hoverEffectSize
        }
        runningYValue += this.playerInputsHeight + inputBoxMargin;
    }

    this.drawHealthBar = (timestamp,healthBar,target) => {

        let xOffset = healthBar.x,yOffset = 0;
        if(target.jitterHealthBar) {
            xOffset += Math.round(Math.random() * 4) - 2;
            yOffset += Math.round(Math.random() * 4) - 2;
        }
        if(target.healthBarDrop) {
            yOffset -= Math.round(Math.random() * 2) - 1;
        }

        const healthBarEnd = Math.floor(this.healthBarWidth * (
            target.health /
            target.maxHealth
        ));

        const offsetY = healthBar.y + yOffset;

        context.fillStyle = healthBar.foregroundColor;
        context.fillRect(
            xOffset,
            offsetY,
            healthBarEnd,
            this.healthBarHeight
        );

        const healthBarEndWidth = this.healthBarWidth - healthBarEnd;
        
        if(healthBarEndWidth !== 0) {
            context.fillStyle = healthBar.backgroundColor;
            context.fillRect(
                healthBarEnd + xOffset,
                offsetY,
                healthBarEndWidth,
                this.healthBarHeight
            );
        }

        drawTextWhite(target.name,healthBar.x,healthBar.textY,this.healthBarTextSize);
    }

    this.hoverColor = this.elf.darkHover ? this.elf.foregroundColor ? this.elf.foregroundColor : "red" : this.elf.foregroundColor ? this.elf.foregroundColor : "rgba(255,255,255,0.7)";
    this.fillColor = this.elf.buttonColor ? this.elf.buttonColor : "rgba(0,0,0,0.8)";

    this.render = timestamp => {

        if(rendererState.background) {
            rendererState.background.render(timestamp);
        } else {
            context.fillStyle = "black";
            context.fillRect(0,0,fullWidth,fullHeight);
        }   

        if(this.battleSequencer.playerBattleObject.subText !== null) {
            let i = 0;
            while(i < this.battleSequencer.playerBattleObject.subText.length) {
                drawTextWhite(
                    this.battleSequencer.playerBattleObject.subText[i],
                    this.leftHealthBar.x,
                    this.subTextY + (i*this.subTextMargin),this.subTextScale
                );
                i++;
            }
        }

        if(!isBoss) {
            let elfX;
            if(this.elfMoveStart) {
                let animationProgress = ((timestamp - this.elfMoveStartTime) / this.elfMoveDuration);
                if(animationProgress >= 1) {
                    elfX = this.elfMoveStart + this.elfMoveDistance;
                    this.elfMoveStart = null;
                    this.elfX = elfX;
                } else {
                    elfX = this.elfMoveStart + (animationProgress * this.elfMoveDistance);
                }
            } else {
                elfX = this.elfX;
            }

            let elfY = 0;

            if(this.battleSequencer.elfBattleObject.jitterHealthBar && !this.battleSequencer.battleOver) {
                elfX += Math.round(Math.random() * 2) - 1;
                elfY += Math.round(Math.random() * 2) - 1;
            }
            let i = 0;
            while(i<this.battleSequencer.elfRenderLayers.length) {
                if(this.battleSequencer.elfRenderLayers[i]) {
                    context.drawImage(
                        imageDictionary[`elves-layer-${i}`],
                        this.elf.x,0,elfSourceWidth,elfSourceHeight,
                        elfX,elfY,this.elfWidth,this.elfHeight
                    );
                }
                i++;
            }

            if(this.battleSequencer.activeAnimations.length > 0) {
                let i = 0;
                while(i < this.battleSequencer.activeAnimations.length) {
                    const activeAnimation = this.battleSequencer.activeAnimations[i];
                    const animation = animationDictionary[activeAnimation.name];
                    if(animation.playOnce) {
                        if(!activeAnimation.complete) {
                            const timestampDifference = timestamp-activeAnimation.startTime;
                            if(animation.realTime) {
                                if(timestampDifference >= animation.fullDuration) {
                                    activeAnimation.complete = true;
                                    activeAnimation.playing = false;
                                    this.battleSequencer.clearAnimation(animation.name);                                   
                                } else {
                                    animation.render(timestampDifference,elfX,elfY,this.elfWidth,this.elfHeight);
                                }
                            } else {
                                const frameNumber = Math.floor(timestampDifference / animation.frameDuration);
                                if(frameNumber >= animation.frameCount) {
                                    activeAnimation.complete = true;
                                } else {
                                    context.drawImage(
                                        imageDictionary["animation-effects"],
                                        animation.frameBounds[frameNumber],animation.y,
                                        elfSourceWidth,elfSourceHeight,
                                        elfX,elfY,this.elfWidth,this.elfHeight
                                    );
                                }
                            }
                        }
                    } else {
                        if(animation.realTime) {
                            animation.render(timestamp,elfX,elfY,this.elfWidth,this.elfHeight,activeAnimation.startTime);
                        } else {
                            const frameNumber = Math.floor(timestamp / animation.frameDuration) % animation.frameCount;
                            context.drawImage(
                                imageDictionary["animation-effects"],
                                animation.frameBounds[frameNumber],animation.y,
                                elfSourceWidth,elfSourceHeight,
                                elfX,elfY,this.elfWidth,this.elfHeight
                            );
                        }
                    }
                    i++;
                }
            }
        } else {
            for(let i = 0;i<this.battleSequencer.activeAnimations.length;i++) {
                const activeAnimation = this.battleSequencer.activeAnimations[i];
                const animation = animationDictionary[activeAnimation.name];
                animation.render(timestamp);
            }
        }

        this.drawHealthBar(
            timestamp,
            this.leftHealthBar,
            this.battleSequencer.playerBattleObject
        );

        this.drawHealthBar(
            timestamp,
            this.rightHealthBar,
            this.battleSequencer.elfBattleObject
        );

        if(this.battleSequencer.bottomMessage !== null) {
            context.fillStyle = "white";
            context.fillRect(
                this.bottomMessageX,
                this.bottomMessageY,
                this.bottomMessageWidth,
                this.bottomMessageHeight
            );
            const textResult = drawTextTest(
                this.battleSequencer.bottomMessage,
                this.bottomMessageTextScale
            );
            drawTextBlack(
                this.battleSequencer.bottomMessage,
                Math.floor(halfWidth - (textResult.width / 2)),
                this.bottomMessageTextY,
                this.bottomMessageTextScale
            );
        }

        if(this.battleSequencer.elfSpeech !== null) {
            context.fillStyle = "white";
            context.fillRect(
                this.elfTextBubbleX,
                this.elfTextBubbleY,
                this.elfTextBubbleWidth,
                this.elfTextBubbleHeight
            );
            let i = 0;
            while(i < this.battleSequencer.elfSpeech.length) {
                drawTextBlack(this.battleSequencer.elfSpeech[i],
                    this.elfTextBubbleX + 8,this.elfTextBubbleY + 8 + (i * 28),4
                );
                i++;
            }
        } else if(this.battleSequencer.elfBattleObject.subText !== null) {
            let i = 0;
            while(i < this.battleSequencer.elfBattleObject.subText.length) {
                drawTextWhite(
                    this.battleSequencer.elfBattleObject.subText[i],
                    this.rightHealthBar.x,
                    this.subTextY + (i*this.subTextMargin),this.subTextScale
                );
                i++;
            }
        }

        if(this.playerInputs) {

            let evenOffset = 0;
            let oddOffset = 0;
            let animating = false;

            if(this.playerInputDisableStartTime !== null) {

                const timeDifference =  timestamp - this.playerInputDisableStartTime;

                let progress = timeDifference / this.playerInputToggleAnimationTime;

                animating = true;

                if(progress >= 1) {
                    progress = 1;
                    animating = false;
                    //this.playerInputDisableStartTime = null;
                }

                const distance = progress * this.playerInputToggleDistance;
                evenOffset = -distance;
                oddOffset = distance;

            } else if(this.playerInputEnableStartTime !== null) {

                const timeDifference =  timestamp - this.playerInputEnableStartTime;

                let progress = 1 - (timeDifference / this.playerInputToggleAnimationTime);

                animating = true;

                if(progress <= 0) {
                    progress = 0;
                    animating = false;
                    //this.playerInputEnableStartTime = null;
                }

                const distance = progress * this.playerInputToggleDistance;
                evenOffset = -distance;
                oddOffset = distance;

            }

            let i = 0;
            while(i<this.playerInputs.length) {
                let xOffset = 0, inputText;
                const input = this.playerInputs[i];
                if(i !== 0) {
                    xOffset = i % 2 === 0 ? evenOffset : oddOffset;
                    inputText = input.name;
                } else {
                    inputText = this.firstInputMask || input.name;
                }

                const yValues = this.playerInputsYValues[i];

                let jitterOffsetX = 0;
                let jitterOffsetY = 0;
                if(this.battleSequencer.playerBattleObject.jitterHealthBar && !this.battleSequencer.battleOver) {
                    jitterOffsetX += Math.round(Math.random() * 2) - 1;
                    jitterOffsetY += Math.round(Math.random() * 2) - 1;                    
                }

                if(i === this.hoverEffectIndex && !animating && this.playerInputsEnabled) {
                    context.fillStyle = this.hoverColor;
                    context.fillRect(
                        this.hoverEffectX+jitterOffsetX,yValues.hoverValue+jitterOffsetY,
                        this.hoverEffectWidth,this.hoverEffectHeight
                    );
                } else if(this.firstInputMask && this.hoverEffectIndex !== null && i === 0 && (this.lastEventWasKeyBased || this.hoverEffectIndex === 0)) {
                    context.fillStyle = this.hoverColor;
                    context.fillRect(
                        this.hoverEffectX+jitterOffsetX,yValues.hoverValue+jitterOffsetY,
                        this.hoverEffectWidth,this.hoverEffectHeight
                    );
                }

                context.fillStyle = this.fillColor;
                context.fillRect(
                    this.playerInputsX + xOffset+jitterOffsetX,yValues.value+jitterOffsetY,
                    this.playerInputsWidth,this.playerInputsHeight
                );   
                if(inputText) {
                    drawTextWhite(
                        inputText,
                        this.playerInputsTextX + xOffset,
                        yValues.textValue,
                        this.playerInputTextScale
                    );
                }
                i++;
            }
        }

        if(this.inEscapeMenu) {
            context.fillStyle = "rgba(0,0,0,0.8)";
            context.fillRect(0,0,fullWidth,fullHeight);
            switch(this.escapeMenuIndex) {
                case 0:
                    context.fillStyle = this.hoverColor;
                    context.fillRect(
                        this.escapeMenuYesButton.x-this.hoverEffectSize,
                        this.escapeMenuYesButton.y-this.hoverEffectSize,
                        this.escapeMenuYesButton.width+this.doubleHoverSize,
                        this.escapeMenuYesButton.height+this.doubleHoverSize
                    );
                    break;
                case 1:
                    context.fillStyle = this.hoverColor;
                    context.fillRect(
                        this.escapeMenuNoButton.x-this.hoverEffectSize,
                        this.escapeMenuNoButton.y-this.hoverEffectSize,
                        this.escapeMenuNoButton.width+this.doubleHoverSize,
                        this.escapeMenuNoButton.height+this.doubleHoverSize
                    );
                    break;
            }
            context.fillStyle = this.fillColor;
            context.fillRect(
                this.escapeMenuYesButton.x,
                this.escapeMenuYesButton.y,
                this.escapeMenuYesButton.width,
                this.escapeMenuYesButton.height
            );
            context.fillStyle = this.fillColor;
            context.fillRect(
                this.escapeMenuNoButton.x,
                this.escapeMenuNoButton.y,
                this.escapeMenuNoButton.width,
                this.escapeMenuNoButton.height
            );
            drawTextWhite(this.escapeMenuText,this.escapeMenuTextX,this.escapeMenuTextY,this.escapeMenuTextScale);
            drawTextWhite(this.yesButtonText.text,this.yesButtonText.x,this.yesButtonText.y,this.yesButtonText.scale);
            drawTextWhite(this.noButtonText.text,this.noButtonText.x,this.noButtonText.y,this.noButtonText.scale);
        }
    }

    this.battleSequencer = new BattleSequencer(this);

    this.lastEventWasKeyBased = false;

    this.inEscapeMenu = false;
    this.escapeMenuIndex = null;

    this.escapeMenuText = "are you sure you want to quit?"
    this.escapeMenuTextScale = 4;

    const escapeMenuTextTest = drawTextTest(this.escapeMenuText,this.escapeMenuTextScale);

    this.escapeMenuTextX = Math.round(halfWidth - (escapeMenuTextTest.width/2));

    const escapeStuffYOffset = -50;

    const verticalEscapeMenuMargin = 20;
    this.escapeMenuTextY = Math.ceil(halfHeight - escapeMenuTextTest.height - verticalEscapeMenuMargin) + escapeStuffYOffset;
    
    const escapeMenuButtonWidth = 300;
    const escapeMenuButtonHeight = 100;
    const escapeMenuButtonY = Math.floor(halfHeight + verticalEscapeMenuMargin) + escapeStuffYOffset;

    this.escapeMenuYesButton = {
        width: escapeMenuButtonWidth,
        height: escapeMenuButtonHeight,
        x: Math.ceil(halfWidth - escapeMenuButtonWidth - 5),
        y: escapeMenuButtonY
    };
    this.escapeMenuNoButton = {
        width: escapeMenuButtonWidth,
        height: escapeMenuButtonHeight,
        x: Math.ceil(halfWidth + 5),
        y: escapeMenuButtonY
    };

    const yesText = "yes";
    const noText = "no";

    const yesButtonTextTest = drawTextTest(yesText,this.playerInputTextScale);
    const noButtonTextTest = drawTextTest(noText,this.playerInputTextScale);

    const halfEscapeMenuWidth = this.escapeMenuYesButton.width / 2;
    const halfEscapeMenuHeight = this.escapeMenuYesButton.height / 2;

    this.yesButtonText = {
        text: yesText,
        x: this.escapeMenuYesButton.x + Math.round(halfEscapeMenuWidth - (yesButtonTextTest.width / 2)),
        y: this.escapeMenuYesButton.y + Math.round(halfEscapeMenuHeight - (yesButtonTextTest.height / 2)),
        scale: this.playerInputTextScale
    };
    this.noButtonText = {
        text: noText,
        x: this.escapeMenuNoButton.x + Math.round(halfEscapeMenuWidth - (noButtonTextTest.width / 2)),
        y: this.escapeMenuNoButton.y + Math.round(halfEscapeMenuHeight - (noButtonTextTest.height / 2)),
        scale: this.playerInputTextScale
    };

    this.forcedSizeMode = sizeModes.classic.name;

    this.processKey = key => {
        if(this.inEscapeMenu) {
            switch(key) {
                case kc.cancel:
                    this.lastEventWasKeyBased = true;
                    this.inEscapeMenu = false;
                    this.escapeMenuIndex = null;
                    break;
                case kc.up:
                case kc.left:
                    this.lastEventWasKeyBased = true;
                    if(this.escapeMenuIndex === null || this.escapeMenuIndex !== 0) {
                        this.escapeMenuIndex = 0;
                    }
                    break;
                case kc.down:
                case kc.right:
                    this.lastEventWasKeyBased = true;
                    if(this.escapeMenuIndex === null) {
                        this.escapeMenuIndex = 0;
                    } else if(this.escapeMenuIndex !== 1) {
                        this.escapeMenuIndex = 1;
                    }
                    break;
                case kc.accept:
                case kc.open:
                    this.lastEventWasKeyBased = true;
                    this.processClick();
                    return;
            }
            return;
        }
        switch(key) {
            case kc.cancel:
                this.lastEventWasKeyBased = true;
                this.inEscapeMenu = true;
                this.escapeMenuIndex = 0;
                break;
            case kc.up:
            case kc.left:
                this.lastEventWasKeyBased = true;
                if(!this.playerInputsEnabled) {
                    if(this.hoverEffectIndex === null) {
                        this.hoverEffectIndex = 0;
                    }
                    break;
                }
                if(this.hoverEffectIndex !== null) {
                    this.hoverEffectIndex--;
                    if(this.hoverEffectIndex < 0) {
                        this.hoverEffectIndex = 0;
                    }
                } else {
                    this.hoverEffectIndex = 0;
                }
                break;
            case kc.down:
            case kc.right:
                this.lastEventWasKeyBased = true;
                if(!this.playerInputsEnabled) {
                    if(this.hoverEffectIndex === null) {
                        this.hoverEffectIndex = 0;
                    }
                    break;
                }
                if(this.hoverEffectIndex !== null) {
                    this.hoverEffectIndex++;
                    const max =  this.playerInputs.length-1;
                    if(this.hoverEffectIndex > max) {
                        this.hoverEffectIndex = max;
                    }
                } else {
                    this.hoverEffectIndex = 0;
                }
                break;
            case kc.accept:
            case kc.open:
                this.lastEventWasKeyBased = true;
                this.processClick();
                return;
        }
    }

    this.getHitRegister = (x,y) => {
        if(this.playerInputs && x >= this.playerInputsX && x <= this.playerInputsX + this.playerInputsWidth) {
            let i = 0;
            while(i<this.playerInputs.length) {
                const yValues = this.playerInputsYValues[i];
                if(y >= yValues.value && y <= yValues.value + this.playerInputsHeight) {
                    return i;
                }
                i++;
            }
        }
        return null;
    }
    this.getHitRegisterEscapeMenu = (x,y) => {
        if(y >= this.escapeMenuYesButton.y && y <= this.escapeMenuYesButton.y + this.escapeMenuYesButton.height) {
            if(x >= this.escapeMenuYesButton.x && x <= this.escapeMenuYesButton.x + this.escapeMenuYesButton.width) {
                return 0;
            } else if(x >= this.escapeMenuNoButton.x && x <= this.escapeMenuNoButton.x + this.escapeMenuNoButton.width) {
                return 1;
            }
        }
        return null;
    }

    this.processMove = (x,y) => {
        this.lastEventWasKeyBased = false;
        if(!this.inEscapeMenu) {
            this.hoverEffectIndex = this.getHitRegister(x,y);
        } else {
            this.escapeMenuIndex = this.getHitRegisterEscapeMenu(x,y);
        }
    }

    this.atWinState = false;

    this.processClick = (x,y) => {
        if(this.inEscapeMenu) {
            if(x > -1 && y > -1) {
                this.escapeMenuIndex = this.getHitRegisterEscapeMenu(x,y);
                this.lastEventWasKeyBased = false;
            } else {
                this.lastEventWasKeyBased;
            }
            if(this.escapeMenuIndex !== null) {
                if(this.escapeMenuIndex === 0) {
                    playSound("click");
                    this.battleSequencer.murderSequencerGracefully();
                    if(this.atWinState) {
                        this.winCallback();
                    } else {
                        this.loseCallback();
                    }
                } else {
                    playSound("click");
                    this.inEscapeMenu = false;
                    this.escapeMenuIndex = null;
                }
            }
            return;
        }
        if(!this.playerInputsEnabled) {
            if(this.battleSequencer.skipHandles.length > 0) {
                playSound("click");
            }
            this.battleSequencer.skipEvent();
            if(x > -1 && y > -1) {
                this.hoverEffectIndex = this.getHitRegister(x,y);
                this.lastEventWasKeyBased = false;
            } else {
                this.lastEventWasKeyBased = true;
            }
            return;
        }
        if(this.playerInputEnableStartTime !== null) {
            const inputEnableEndTime =
                this.playerInputEnableStartTime
                + this.playerInputToggleAnimationTime;

            if(performance.now() < inputEnableEndTime) {
                return;
            }
        }
        let hitRegister;
        if(x > -1 && y > -1) {
            hitRegister = this.getHitRegister(x,y);
            this.lastEventWasKeyBased = false;
        } else {
            hitRegister = this.hoverEffectIndex;
            this.lastEventWasKeyBased = true;
        }
        if(hitRegister !== null) {
            playSound("click");
            this.battleSequencer.processPlayerInput(
                hitRegister
            );
        }
    }
}
