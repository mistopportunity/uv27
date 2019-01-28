const animationDictionary = {
    crying: {
        realTime: true,
        fullDuration: 750,
        render: (timestamp,x,y,width,height) => {
            const pixelSize = width / elfSourceWidth;
            const tearOneX = pixelSize * 4;
            const tearTwoX = pixelSize * 6;

            const tearYOffset = tearTwoX + pixelSize;

            const timeNormal = (timestamp % animationDictionary.crying.fullDuration) / animationDictionary.crying.fullDuration;

            const tearOneY = ((timeNormal % 1)*16)*pixelSize;
            const tearTwoY = (((timeNormal+0.5) % 1)*16)*pixelSize;

            context.fillStyle = "rgba(0,82,255,0.32)";
            context.fillRect(x+tearOneX,y+tearOneY+tearYOffset,pixelSize,pixelSize);

            context.fillStyle = "rgba(0,82,255,0.32)";
            context.fillRect(x+tearTwoX,y+tearTwoY+tearYOffset,pixelSize,pixelSize);
        },
        playOnce: false
    },
    henry: {
        realTime: true,
        ratio: 26 / 42,
        smokeDuration: 1800,

        smokeFadeInTime: 800,
        smokeFadeOutTime: 800,

        smokeMaxSize: 60,
        smokeMinSize: 40,
        smokeCount: 120,
        areaOverflow: 50,
        halfAreaOverflow: 25,
        renderSmoke: (count,x,y,width,height) => {
            for(let i = 0;i<count;i++) {
                const intensity = Math.random();
                const shade = Math.round(intensity * 255);
                const size = Math.floor((intensity * animationDictionary.henry.smokeRange) + (animationDictionary.henry.smokeMinSize * (count / animationDictionary.henry.smokeCount)));
                
                const halfSize = size / 2;
                const smokeX = Math.floor(x + ((((width+animationDictionary.henry.areaOverflow) * Math.random())-animationDictionary.henry.halfAreaOverflow) - halfSize));
                const smokeY = Math.floor((height * Math.random()) - halfSize);
                
                context.fillStyle = `rgb(${shade},${shade},${shade})`;
                context.fillRect(smokeX,smokeY,size,size);
            }
        },
        render: (timestamp,x,y,width,height,startTime) => {
            if(timestamp >= startTime + animationDictionary.henry.smokeDuration) {
                const newWidth = Math.round(height * animationDictionary.henry.ratio);
                const newX = Math.round(x + ((width / 2) - (newWidth / 2)));
                context.drawImage(imageDictionary["henry"],0,0,26,40,newX,y,newWidth,height);

                const smokeCount = animationDictionary.henry.smokeCount - Math.round(((timestamp - (startTime + animationDictionary.henry.smokeDuration)) / animationDictionary.henry.smokeFadeOutTime)*animationDictionary.henry.smokeCount);
                if(smokeCount>=1) {
                    animationDictionary.henry.renderSmoke(smokeCount,x,y,width,height);
                }

            } else {
                const smokeCount = Math.round(((timestamp - startTime) / animationDictionary.henry.smokeFadeInTime)*animationDictionary.henry.smokeCount);
                if(smokeCount > animationDictionary.henry.smokeCount) {
                    animationDictionary.henry.renderSmoke(animationDictionary.henry.smokeCount,x,y,width,height);
                } else {
                    animationDictionary.henry.renderSmoke(smokeCount,x,y,width,height);
                }
            }
        }
    },
    robeSmoke: {
        index: 1,
        frameCount: 2,
        frameRate: 30,
        playOnce: true
    },
    robeHealth: {
        index: 2,
        frameCount: 5,
        frameRate: 30,
        playOnce: true
    },
    punch: {
        fullDuration: 60,
        realTime: true,
        render: (timestamp,x,y,width,height) => {

            const size = (1 - (timestamp / animationDictionary.punch.fullDuration)) * 100;

            const halfSize = size/2;

            x += Math.round((width / 2) - halfSize);
            y += Math.round((height / 2) - halfSize);

            context.lineWidth = 8;
            context.strokeStyle = "red";
            context.strokeRect(x,y,size,size);
        },
        playOnce: true
    }
}
animationDictionary.henry.smokeRange = animationDictionary.henry.smokeMaxSize - animationDictionary.henry.smokeMinSize;
