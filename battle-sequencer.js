function BattleSequencer(renderer) {

    this.sequencerPersisting = true;
    this.murderSequencerGracefully = () => {
        this.sequencerPersisting = false;
        while(this.skipHandles.length > 0) {
            this.skipEvent(true);
        }
    }

    this.skipHandles = [];
    this.skipEvent = suppress => {
        if(this.skipHandles.length > 0) {
            if(this.skipHandles.length > 100) {
                console.warn("Warning: The skip handle count is very high");
            }
            let skipHandle;
            do {
                skipHandle = this.skipHandles.shift();
            } while (
                !timeouts[skipHandle] && //If we have a timeout the still exists, we break the loop
                this.skipHandles.length > 0);//If we run out of handles, we break the loop

            if(timeouts[skipHandle]) {
                clearSkippableTimeout(skipHandle,suppress);
            }
        }
    }

    this.turboTextEnabled = false;
    this.turboTextVelocity = 80;

    this.enableTurboText = velocity => {
        this.turboTextEnabled = true;
        if(velocity) {
            this.turboTextVelocity = velocity;
        }
    }
    this.disableTurboText = () => this.turboTextEnabled = false;

    this.debugInfinity = false;

    this.getTextDuration = text => {
        if(this.turboTextEnabled) {
            return this.turboTextVelocity;
        } else if(this.debugInfinity) {
            return Infinity;
        } else {
            return 10000;
        }
    }

    this.elf = renderer.elf;

    const endScreenLength = 4000;
    const postSongDelay = 1000;

    this.everybodyDiedMethod = () => {
        if(!this.sequencerPersisting) {
            return;
        }
        this.bottomMessage = "everyone is dead";
        renderer.firstInputMask = "game over";
        let duration = endScreenLength;
        if(this.showingPersistentSpeech) {
            duration += this.persistentSpeechDuration;
        }
        if(!musicMuted) {
            if(musicNode) {
                stopMusic(0);
            }
            let songDuration = playMusic("lose",0,false) * 1000;
            if(songDuration > duration) {
                duration = songDuration + postSongDelay;
            } else if (duration < songDuration + postSongDelay) {
                duration += (postSongDelay + songDuration) - duration;
            }
        }

        this.skipHandles.push(setSkippableTimeout(renderer.loseCallback,duration));
    }

    this.playerDiedMethod = () => {
        if(!this.sequencerPersisting) {
            return;
        }
        this.bottomMessage = "you are dead";
        renderer.firstInputMask = "game over";

        let duration = endScreenLength;
        if(this.elf.getWinSpeech) {
            const speech = this.elf.getWinSpeech(this);
            if(speech) {
                this.showElfSpeech(speech,0,Infinity);
                duration += this.getTextDuration(speech);
            }
        } else if(this.showingPersistentSpeech) {
            duration += this.persistentSpeechDuration;
        }
        if(!musicMuted) {
            if(musicNode) {
                stopMusic(0);
            }
            let songDuration = playMusic("lose",0,false) * 1000;
            if(songDuration > duration) {
                duration = songDuration + postSongDelay;
            } else if (duration < songDuration + postSongDelay) {
                duration += (postSongDelay + songDuration) - duration;
            }
        }

        this.skipHandles.push(setSkippableTimeout(renderer.loseCallback,duration));

    }
    this.elfDiedMethod = () => {
        if(!this.sequencerPersisting) {
            return;
        }
        this.bottomMessage = `${this.elf.name} is dead`;
        renderer.firstInputMask = "a job well done";

        let duration = endScreenLength;
        if(this.elf.getLoseSpeech) {
            const speech = this.elf.getLoseSpeech(this);
            if(speech) {
                this.showElfSpeech(speech,0,Infinity);
                duration += this.getTextDuration(speech);
            }
        } else if(this.showingPersistentSpeech) {
            duration += this.persistentSpeechDuration;
        }
        if(!musicMuted) {
            if(musicNode) {
                stopMusic(0);
            }
            let songDuration = playMusic("win.ogg",0,false) * 1000;
            if(songDuration > duration) {
                duration = songDuration + postSongDelay;
            } else if (duration < songDuration + postSongDelay) {
                duration += (postSongDelay + songDuration) - duration;
            }
        }
        rendererState.atWinState = true;
        this.skipHandles.push(setSkippableTimeout(renderer.winCallback,duration));
    }

    this.globalBattleState = this.elf.getDefaultGlobalState ?
        this.elf.getDefaultGlobalState():{}

    if(!this.globalBattleState.movePreProcess) {
        this.globalBattleState.movePreProcess = null;
    }
    if(!this.globalBattleState.postTurnProcess) {
        this.globalBattleState.postTurnProcess = null;
    }

    this.playerHasDied = false;
    this.elfHasDied = false;

    this.playerBattleObject = {
        isPlayer: true,
        isElf: false,
        isDead: false,
        isAlive: true,
        health: 100,
        maxHealth: 100,
        jitterHealthBar: false,
        healthBarDrop: false,
        name: "you",
        disabledMoves: {},
        lastMove: null,
        lastMoveFailed: null,
        movePreProcess: null,
        subText: null,
        dropHealth: amount => this.dropHealth(this.playerBattleObject,amount),
        addHealth: amount => this.addHealth(this.playerBattleObject,amount)
    };
    this.elfBattleObject = {
        isPlayer: false,
        isElf: true,
        isDead: false,
        isAlive: true,
        health: this.elf.health,
        maxHealth: this.elf.health,
        jitterHealthBar: false,
        healthBarDrop: false,
        name: this.elf.name,
        disabledMoves: {},
        lastMove: null,
        lastMoveFailed: null,
        movePreProcess: null,
        subText: null,
        dropHealth: amount => this.dropHealth(this.elfBattleObject,amount),
        addHealth: amount => this.addHealth(this.elfBattleObject,amount)
    };
    this.dropHealth = (target,amount) => {
        if(this.sequencerPersisting) {
            playSound("clip");
        }
        target.health -= amount;
        target.jitterHealthBar = true;
        if(target.health <= 0) {
            target.health = 0;
            if(target.isPlayer) {
                this.playerHasDied = true;
                this.playerBattleObject.isDead = true;
                this.playerBattleObject.isAlive = false;
            } else {
                this.elfHasDied = true;
                this.elfBattleObject.isDead = true;
                this.elfBattleObject.isAlive = false;
            }
        } else {
            setTimeout(()=>{
                target.jitterHealthBar = false;
            },100);
        }
    },
    this.addHealth = (target,amount) => {
        target.health += amount;
        if(this.sequencerPersisting) {
            playSound("reverse-clip");
        }
        target.healthBarDrop = true;
        if(target.health > target.maxHealth) {
            target.health = target.maxHealth;
        }
        setTimeout(()=>{
            target.healthBarDrop = false;
        },80);
    }

    if(this.elf.getDefaultPlayerState) {
        this.playerBattleObject.state = this.elf.getDefaultPlayerState();
    } else {
        this.playerBattleObject.state = {};
    }
    if(this.elf.getDefaultElfState) {
        this.elfBattleObject.state = this.elf.getDefaultElfState();
    } else {
        this.elfBattleObject.state = {};
    }

    this.processPlayerInput = moveIndex => {
        if(!this.sequencerPersisting) {
            return;
        }
        this.playerMove(
            this.playerMoves[moveIndex]
        );
    }

    this.showText = (text,delay,duration,callback) => {
        if(!duration) {
            duration = 1000;
        }
        const innerMethod = () => {
            if(this.sequencerPersisting) {
                this.bottomMessage = text;
                if(duration !== Infinity ) {
                    this.skipHandles.push(setSkippableTimeout(()=>{
                        this.bottomMessage = null;
                        if(callback) {
                            callback();
                        }
                    },duration));
                }
            }
        }
        if(delay) {
            if(this.sequencerPersisting) {
                this.skipHandles.push(setSkippableTimeout(innerMethod,delay));
            }
        } else {
            innerMethod();
        }
    }

    this.processTheMoveAndStuff = (move,user,target,callback,moveDisplayName) => {
        let moveResult;
        if(!move) {
            moveResult = {
                failed: true,
                text: "but the developer made a mistake"
            }
            console.error("Error: Hey idiot, you probably have a move key wrong");
        } else if(user.disabledMoves[move.name]) {
            moveResult = {
                failed: true,
                text: "but it has been disabled"
            }
        } else if(target.isDead && move.type === "target") {
            moveResult = {
                failed: true,
                text: "but their target is already dead"
            }
        } else {
            let skip = false;
            let processedMove = move;
            if(this.globalBattleState.movePreProcess !== null) {
                processedMove = this.globalBattleState.movePreProcess(this,processedMove);
                if(!move) {
                    moveResult = {
                        failed: true,
                        text: "but the developer made a mistake"
                    }
                    skip = true;
                    console.error("Error: The global preprocessor didn't return an acceptable value");
                }
            }
            if(!skip && user.movePreProcess !== null) {
                processedMove = user.movePreProcess(this,processedMove);
                if(!processedMove) {
                    moveResult = {
                        failed: true,
                        text: "but the developer made a mistake"
                    }
                    skip = true;
                    console.error("Error: The move user's move preprocessor didn't return an acceptabe value");
                }
            }
            if(!skip) {
                if(processedMove.process) {
                    moveResult = processedMove.process(
                        this,
                        user,
                        target
                    );
                } else {
                    moveResult = {
                        failed: true,
                        text: "but the developer made a mistake"
                    }
                    console.error(`Error: Move '${processedMove.name ? processedMove.name : "<Missing name>"}' is missing a process method`);
                }
            }
            if(moveResult && moveResult.failed === true && !moveResult.text && !moveResult.events) {
                moveResult = {
                    failed: true,
                    text: "but it failed"
                }
            }
        }
        if(!moveResult) {
            if(moveResult === null) {
                moveResult = {};
            } else {
                moveResult = {
                    failed: true,
                    text: "but the developer made a mistake"
                };
            }
        }
        user.lastMove = moveDisplayName || null;
        if(!moveResult.failed) {
            if(moveResult.failed !== false) {
                moveResult.failed = false; 
            }
        } else if(moveResult.failed !== true) {
            moveResult.failed = true;
        }
        if(moveResult.text || moveResult.speech || moveResult.action) {
            moveResult.events = [{
                text:moveResult.text,
                speech:moveResult.speech,
                action:moveResult.action}
            ];
        }
        if(moveResult.events && moveResult.events.length >= 1) {
            let eventIndex = 0;
            const processNextEvent = () => {
                const event = moveResult.events[
                    eventIndex
                ];
                const callingIndex = eventIndex;
                eventIndex++;
                this.processEvent(event,moveResult.events,processNextEvent,callback,callingIndex);
            }
            processNextEvent();
        } else if(callback) {
            callback();
        } else {
            this.returnInput();
            console.error("Error: Missing callback state");
        }
    }

    this.genericMove = (move,user,target,callback) => {
        if(!move || !move.name) {
            callback();
            if(move !== null) {
                console.error("Error: Missing move");
            }
            return;
        }
        if(move.type !== "interface") {
            const moveDisplayName = move.name.split("-")[0].trimEnd();
            const text = `${user.name} ${move.type === "option" ? "chose" : "used"} ${moveDisplayName}`;
                this.showText(
                    text,0,this.getTextDuration(text)
                    ,()=>this.processTheMoveAndStuff(move,user,target,callback,moveDisplayName)
            );
        } else {
            this.processTheMoveAndStuff(move,user,target,callback,move.name);
        }
    }

    this.playerMove = move => {
        if(this.showingPersistentSpeech) {
            this.clearPersistentSpeech();
        }
        if(this.sequencerPersisting) {
            renderer.disablePlayerInputs();
        }
        this.genericMove(move,
            this.playerBattleObject,
            this.elfBattleObject,
            ()=>{
                if(!this.elfHasDied) {
                    this.elfMove();
                } else {
                    this.returnInput();
                }
            }
        );
    }

    this.elfMove = () => {
        let move = null;
        if(this.elf.getMove) {
            move = this.elf.getMove(this);
            if(!move && move !== null) {
                console.warn("Battle sequencer: elf.getMove() returned no valid move. Was this intentional?");
            }
        }
        const callback = () => {
            if(!this.playerHasDied) {
                let elfSpeech = null;
                let speechPersistence = false;
                if(this.elf.getSpeech) {
                    let elfSpeechResult = this.elf.getSpeech(this);
                    if(elfSpeechResult) {
                        if(elfSpeechResult.text) {
                            elfSpeech = elfSpeechResult.text;
                            if(elfSpeechResult.persist === true) {
                                speechPersistence = true;
                            }
                        }
                    } else if(elfSpeechResult !== null) {
                        console.error("Battle sequencer: elf.getSpeech did not return a proper value");
                    }
                    if(!elfSpeech) {
                        elfSpeech = null;
                    }
                }
                if(elfSpeech !== null) {
                    this.showElfSpeech(
                        elfSpeech,0,
                        speechPersistence ? Infinity : this.getTextDuration(elfSpeech) * 1.33,
                        this.returnInput
                    );
                } else {
                    this.returnInput();
                }
            } else {
                this.returnInput();
            }
        }
        if(move !== null) {
            this.genericMove(
                move,
                this.elfBattleObject,
                this.playerBattleObject,
                callback
            );
        } else {
            callback();
        }
    }

    this.processEvent = (event,eventsList,recursiveCallback,endCallback,index) => {
        if(!this.sequencerPersisting) {
            return;
        }
        let callback;
        if(event.condition) {
            if(!event.condition(this)) {
                callback = index >= eventsList.length-1 ? endCallback : recursiveCallback;
                callback();
                return;
            }
        }
        if(event.action) {
            const actionResult = event.action(this);
            if(actionResult) {
                if(actionResult.text || actionResult.speech || actionResult.action) {
                    eventsList.push({
                        text:actionResult.text,
                        speech:actionResult.speech,
                        action:actionResult.action
                    });
                } else if(actionResult.events) {
                    for(let i = 0;i<actionResult.events.length;i++) {
                        const actionResultEvent = actionResult.events[i];
                        eventsList.push({
                            text:actionResultEvent.text,
                            speech:actionResultEvent.speech,
                            action:actionResultEvent.action
                        });
                    }
                }
            }
        }
        callback = index >= eventsList.length-1 ? endCallback : recursiveCallback;
        if(event.text) {
            this.showText(event.text,0,this.getTextDuration(event.text),
            ()=>{
                if(event.speech) {
                    this.showElfSpeech(
                        event.speech,0,
                        this.getTextDuration(event.speech),
                        callback
                    );
                } else {
                    callback();
                }
            });
        } else if(event.speech) {
            this.showElfSpeech(
                event.speech,0,
                this.getTextDuration(event.speech),
                callback
            );               
        } else {
            callback();
        }
    }

    this.showingPersistentSpeech;
    this.persistentSpeechDuration;

    this.clearSpeech = () => {
        if(this.sequencerPersisting) {
            this.elfSpeech = null;
            renderer.moveElf(80,0.5);
        }
    }

    this.clearPersistentSpeech = () => {
        if(!this.showingPersistentSpeech) {
            console.error("Battle sequencer internal error: We cannot clear a persistent speech because there isn't one");
            return;
        }

        this.clearSpeech();

        this.showingPersistentSpeech = false;
    }

    this.elfSpeech = null;
    this.showElfSpeech = (text,delay,duration,callback) => {
        if(!duration) {
            duration = 1000;
        }
        const innerMethod = () => {
            if(this.sequencerPersisting) {
                this.elfSpeech = text.split("\n");
                renderer.moveElf(80,0.25);
                if(duration !== Infinity) {
                    this.skipHandles.push(setSkippableTimeout(()=>{
                        this.clearSpeech();
                        if(callback) {
                            callback();
                        }
                    },duration));
                } else {
                    this.persistentSpeechDuration = this.getTextDuration(text);
                    this.showingPersistentSpeech = true;
                    if(callback) {
                        callback();
                    }
                }
            }
        }
        if(delay) {
            if(this.sequencerPersisting) {
                this.skipHandles.push(setSkippableTimeout(innerMethod,delay));
            }
        } else {
            innerMethod();
        }
    }

    this.turnNumber = 0;

    this.returnInput = () => {
        this.skipHandles = [];
        this.turnNumber++;
        if(this.elfHasDied && this.playerHasDied) {
            this.everybodyDiedMethod();
        } else if(this.elfHasDied) {
            this.elfDiedMethod();
        } else if(this.playerHasDied) {
            this.playerDiedMethod();
        } else {
            const endCallback = () => {
                if(this.elfHasDied && this.playerHasDied) {
                    this.everybodyDiedMethod();
                } else if(this.elfHasDied) {
                    this.elfDiedMethod();
                } else if(this.playerHasDied) {
                    this.playerDiedMethod();
                } else {
                    if(this.sequencerPersisting) {
                        renderer.enablePlayerInputs();
                    }
                }
            }
            if(this.globalBattleState.postTurnProcess !== null) {
                const turnProcessResult = this.globalBattleState.postTurnProcess(this);
                if(turnProcessResult) {
                    if(turnProcessResult.text || turnProcessResult.speech || turnProcessResult.action) {
                        turnProcessResult.events = [{
                            text:turnProcessResult.text,
                            speech:turnProcessResult.speech,
                            action:turnProcessResult.action}
                        ];
                    }
                    if(turnProcessResult.events && turnProcessResult.events.length >= 1) {
                        let eventIndex = 0;
                        const processNextEvent = () => {
                            const event = turnProcessResult.events[
                                eventIndex
                            ];
                            const callingIndex = eventIndex;
                            eventIndex++;
                            this.processEvent(event,turnProcessResult.events,processNextEvent,endCallback,callingIndex);
                        }
                        processNextEvent();
                    } else {
                        endCallback();
                    }

                } else {
                    endCallback();
                }
            } else {
                endCallback();
            }
        }
    }

    this.updatePlayerMoves = moves => {
        if(this.sequencerPersisting) {
            renderer.playerInputs = moves;
        }
        this.playerMoves = moves;
    }

    this.bottomMessage = null;

    if(this.elf.setup) {
        this.elf.setup(this);
    }

    if(!this.elf.playerMoves) {
        if(this.elf.getPlayerMoves) {
            this.updatePlayerMoves(this.elf.getPlayerMoves(this));
        } else {
            this.elf.playerMoves = [moves["honorable suicide"]];
            this.elf.getWinSpeech = () => "developer used lazy\n\ndeveloper laziness\nis super effective\n\nsomething something\nvv meta owo";
            this.updatePlayerMoves(this.elf.playerMoves);
        }
    } else {
        this.updatePlayerMoves(this.elf.playerMoves);
    }

    if(this.elf.startText) {
        if(this.sequencerPersisting) {
            renderer.disablePlayerInputs();
        }
        const endMethod = !this.elf.startSpeech && this.elf.startSpeech.text?
            renderer.enablePlayerInputs: 
            () => {
                this.showElfSpeech(
                    this.elf.startSpeech.text,
                    0,this.elf.startSpeech.persist ? Infinity : this.getTextDuration(this.elf.startSpeech.text),
                    renderer.enablePlayerInputs
                );
            }
        this.showText(
            this.elf.startText,0,
            500+this.getTextDuration(this.elf.startText),
            endMethod
        );
    } else {
        const startEnd = renderer.enablePlayerInputs;
        if(this.elf.startSpeech && this.elf.startSpeech.text) {
            if(this.sequencerPersisting) {
                renderer.disablePlayerInputs();
            }
            this.showElfSpeech(
                this.elf.startSpeech.text,0,
                this.elf.startSpeech.persist ? Infinity : 500+this.getTextDuration(this.elf.startSpeech.text),
                startEnd
            );
        } else {
            startEnd();
        }
    }
}

const timeouts = {};
const setSkippableTimeout = (handler,timeout,...args) => {
    const handle = setTimeout((...args)=>{

        handler.apply(this,args);
        delete timeouts[handle];

    },timeout,...args);

    timeouts[handle] = {
        handler: handler,
        args: args
    }

    return handle;
}

const clearSkippableTimeout = (handle,suppress) => {
    clearTimeout(handle);

    const timeout = timeouts[handle];

    if(!suppress) {
        timeout.handler.apply(
            this,timeout.args
        );
    }

    delete timeouts[handle];
}
