const getFader = function() {
    const fader = {
        delta: 0,
        time: 600,
        start: null,
        fadeInDelay: 400,
        transitionParameters: null,
        transitionRenderer: null,
        inMethod: null,
        fadeIn: exitMethod => {
            startRenderer();
            rendererState.fader.delta = -1;
            rendererState.fader.start = performance.now();
            if(exitMethod) {
                rendererState.fader.inMethod = exitMethod;
            }
            const staticTime = rendererState.fader.time / 1000;
            playSound("swish-2.mp3",staticTime);
            if(rendererState.song) {
                if(rendererState.songIntro) {
                    playMusicWithIntro(renderererState.song,renderererState.songIntro,staticTime);
                } else {
                    playMusic(rendererState.song,staticTime);
                }
            }
        },
        fadeOut: (rendererGenerator,...parameters) => {
            rendererState.fader.delta = 1;
            rendererState.fader.start = performance.now();
            rendererState.fader.transitionRenderer = rendererGenerator;
            rendererState.fader.transitionParameters = parameters;
            const staticTime = rendererState.fader.time / 1000;
            playSound("swish-1.mp3",staticTime);
            if(musicNode) {
                stopMusic(staticTime);
            }
        },
        oninEnd: () => {
            if(rendererState.fader.inMethod) {
                rendererState.fader.inMethod();
            }
            console.log("Transition complete");
        },
        onoutEnd: () => {
            pauseRenderer();
            if(rendererState.fader.transitionRenderer) {
                rendererState = new rendererState.fader.transitionRenderer(
                    ...rendererState.fader.transitionParameters
                );
                if(rendererState.fader) {
                    setTimeout(rendererState.fader.fadeIn,rendererState.fader.fadeInDelay);
                }
            } else {
                console.error("Error: Missing fader transition state");
            }
        },
        process: (context,timestamp,width,height) => {
            if(rendererState.fader.delta !== 0) {
                let fadeIntensity;
                if(rendererState.fader.delta > 0) {
                    fadeIntensity = (timestamp - rendererState.fader.start) / rendererState.fader.time;
                    if(fadeIntensity > 1) {
                        fadeIntensity = 1;
                    }
                } else {
                    fadeIntensity = 1 - (timestamp - rendererState.fader.start) / rendererState.fader.time;
                    if(fadeIntensity < 0) {
                        rendererState.fader.delta = 0;
                        rendererState.fader.oninEnd();
                        return;
                    }
                }

                noiseBlackOut(
                    fadeIntensity,
                    context,width,height,
                    15 + (fadeIntensity * 40),
                    255 - (fadeIntensity * 255)
                );

                if(fadeIntensity === 1 && rendererState.fader.delta === 1) {
                    rendererState.fader.delta = 0;
                    rendererState.fader.onoutEnd();
                }

            }
        }
    }
    return fader;
}