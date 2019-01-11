function BattleSeqeuencer(renderer) {

    this.skipHandles = [];
    this.skipEvent = () => {
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
                clearSkippableTimeout(skipHandle);
            }
        }
    }

    this.elf = renderer.elf;

    const endScreenLength = 3750;

    this.everybodyDiedMethod = () => {
        this.bottomMessage = "everyone is dead";
        renderer.firstInputMask = "game over";
        this.skipHandles.push(setSkippableTimeout(renderer.loseCallback,endScreenLength));
    }

    this.playerDiedMethod = () => {
        this.bottomMessage = "you are dead";
        renderer.firstInputMask = "game over";

        let duration = endScreenLength;
        if(this.elf.getWinSpeech) {
            const speech = this.elf.getWinSpeech(this);
            if(speech) {
                this.showElfSpeech(speech,0,Infinity);
                duration += this.getTextDuration(speech);
            }
        }
        
        this.skipHandles.push(setSkippableTimeout(renderer.loseCallback,duration));

    }
    this.elfDiedMethod = () => {
        this.bottomMessage = `${this.elf.name} is dead`;
        renderer.firstInputMask = "a job well done";

        let duration = endScreenLength;
        if(this.elf.getLoseSpeech) {
            const speech = this.elf.getLoseSpeech(this);
            if(speech) {
                this.showElfSpeech(speech,0,Infinity);
                duration += this.getTextDuration(speech);
            }
        }

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
        dropHealth: amount => {
            this.dropHealth(playerBattleObject,amount)
        }
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
        dropHealth: amount => {
            this.dropHealth(elfBattleObject,amount)
        }
    };
    this.dropHealth = (target,amount) => {
        playSound("clip.mp3");
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
        playSound("reverse-clip.mp3");
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
        this.playerMove(
            this.playerMoves[moveIndex]
        );
    }

    this.showText = (text,delay,duration,callback) => {
        if(!duration) {
            duration = 1000;
        }
        const innerMethod = () => {
            this.bottomMessage = text;
            if(duration !== Infinity) {
                this.skipHandles.push(setSkippableTimeout(()=>{
                    this.bottomMessage = null;
                    if(callback) {
                        callback();
                    }
                },duration));
            }
        }
        if(delay) {
            this.skipHandles.push(setSkippableTimeout(innerMethod,delay));
        } else {
            innerMethod();
        }
    }

    this.genericMove = (move,user,target,callback) => {

        if(!move || !move.name) {
            callback();
            console.error("Error: Missing move");
            return;
        }

        const moveDisplayName = move.name.split("-")[0].trimEnd();

        const text = `${user.name} ${move.type === "option" ? "chose" : "used"} ${moveDisplayName}`;
        this.showText(text,0,this.getTextDuration(text),()=>{
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
                if(moveResult && moveResult.failed === true && !moveResult.text) {
                    moveResult = {
                        failed: true,
                        text: "but it failed"
                    }
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
            user.lastMoveFailed = moveResult.failed;
            if(moveResult.text) {
                this.showText(
                    moveResult.text,0,
                    this.getTextDuration(moveResult.text),
                    callback
                );
            } else if(callback) {
                callback();
            } else {
                this.returnInput();
                console.error("Error: Missing callback state");
            }
        });

    }

    this.getTextDuration = text => {
        return 1150 + (text.split(" ").length * 300);
    }

    this.playerMove = move => {
        renderer.disablePlayerInputs();
        if(this.showingpersistentSpeech) {
            this.clearPersistentSpeech();
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
            if(!move) {
                console.warn("Battle sequencer: elf.getMove() returned no move. Was this intentional?");
            }
        } else {
            //console.warn("Battle sequencer: elf object has no getMove() method. Was this intentional?");
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
                            } else {
                                console.warn(`Battle sequencer: got an unexpected value for 'persist' @ ${elfSpeechResult.text}`);
                            }
                        }
                    } else {
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

    this.showingpersistentSpeech;

    this.clearSpeech = () => {
        this.elfSpeech = null;
        renderer.moveElf(80,0.5);
    }

    this.clearPersistentSpeech = () => {
        if(!this.showingpersistentSpeech) {
            console.error("Battle sequencer internal error: We cannot clear a persistent speech because there isn't one");
            return;
        }

        this.clearSpeech();

        this.showingpersistentSpeech = false;
    }

    this.elfSpeech = null;
    this.showElfSpeech = (text,delay,duration,callback) => {
        if(!duration) {
            duration = 1000;
        }
        const innerMethod = () => {
            this.elfSpeech = text.split("\n");
            renderer.moveElf(80,0.25);
            if(duration !== Infinity) {
                this.skipHandles.push(setSkippableTimeout(()=>{
                    this.clearSpeech();
                    if(callback) {
                        callback();
                    }
                },duration));
            } else if(callback) {
                callback();
                this.showingpersistentSpeech = true;
            }
        }
        if(delay) {
            this.skipHandles.push(setSkippableTimeout(innerMethod,delay));
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
                    renderer.enablePlayerInputs();
                }
            }
            if(this.globalBattleState.postTurnProcess !== null) {
                const turnProcessResult = this.globalBattleState.postTurnProcess(this);
                if(turnProcessResult && turnProcessResult.text) {
                    this.showText(turnProcessResult.text,0,
                        this.getTextDuration(turnProcessResult.text),
                    ()=>{
                        if(turnProcessResult.speech) {
                            this.showElfSpeech(
                                turnProcessResult.speech,0,
                                getTextDuration(turnProcessResult.speech),
                                endCallback
                            );
                        } else {
                            endCallback();
                        }
                    });
                } else {
                    endCallback();
                }
            } else {
                endCallback();
            }
        }
    }

    this.updatePlayerMoves = moves => {
        renderer.playerInputs = moves;
        this.playerMoves = moves;
    }

    this.bottomMessage = null;

    if(this.elf.setup) {
        this.elf.setup(this);
    }

    if(!this.elf.playerMoves) {
        this.elf.playerMoves = [moves["honorable suicide"]];
        this.elf.getWinSpeech = () => "developer used lazy\n\ndeveloper laziness\nis super effective\n\nsomething something\nvv meta owo";
    }
    renderer.playerInputs = this.elf.playerMoves;
    this.playerMoves = this.elf.playerMoves;

    if(this.elf.startText) {
        renderer.disablePlayerInputs();
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
            renderer.disablePlayerInputs();
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

const clearSkippableTimeout = handle => {
    clearTimeout(handle);

    const timeout = timeouts[handle];

    timeout.handler.apply(
        this,timeout.args
    );

    delete timeouts[handle];
}
