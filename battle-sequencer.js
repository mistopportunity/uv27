function BattleSeqeuencer(renderer) {

    this.elf = renderer.elf;

    this.playerDiedMethod = () => {
        this.bottomMessage = "you are dead";
        renderer.firstInputMask = "game over";

        let duration = 4000;
        if(this.elf.getWinSpeech) {
            const speech = this.elf.getWinSpeech();
            this.showElfSpeech(speech,0,Infinity);
            duration += this.getTextDuration(speech);
        }
        
        setTimeout(() => {
            elfIndex--;
            renderer.battleEndCallback();
        },duration);

    }
    this.elfDiedMethod = () => {
        this.bottomMessage = `${this.elf.name} ran out of christmas spirit`;
        renderer.firstInputMask = "a job well done";


        let duration = 3500;
        if(this.elf.getLoseSpeech) {
            const speech = this.elf.getLoseSpeech();
            this.showElfSpeech(speech,0,Infinity);
            duration += this.getTextDuration(speech);
        }

        setTimeout(renderer.battleEndCallback,duration);
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
        movePreProcess: null,
        dropHealth: amount => {
            this.dropHealth(elfBattleObject,amount)
        }
    };
    
    this.dropHealth = (target,amount) => {
        target.health -= amount;
        target.jitterHealthBar = true;
        if(target.health <= 0) {
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
            this.elf.playerMoves[moveIndex]
        );
    }

    this.showText = (text,delay,duration,callback) => {
        if(!duration) {
            duration = 1000;
        }
        const innerMethod = () => {
            this.bottomMessage = text;
            if(duration !== Infinity) {
                setTimeout(()=>{
                    this.bottomMessage = null;
                    if(callback) {
                        callback();
                    }
                },duration);
            }
        }
        if(delay) {
            setTimeout(innerMethod,delay);
        } else {
            innerMethod();
        }
    }

    this.genericMove = (move,user,target,callback) => {
        const text = `${user.name} used ${move.name}`;
        this.showText(text,0,this.getTextDuration(text),()=>{
            let moveResult;
            if(!move) {
                moveResult = {
                    text: "but the developer made a mistake"
                }
                console.error("Hey idiot, you probably have a move key wrong");
            } else if(user.disabledMoves[move.name]) {
                moveResult = {
                    text: "but it has been disabled"
                }
            } else if(target.isDead && move.type === "target") {
                moveResult = {
                    text: "but their target is already dead"
                }
            } else {
                if(this.globalBattleState.movePreProcess !== null) {
                    move = this.globalBattleState.movePreProcess(move);
                }
                if(user.movePreProcess !== null) {
                    move = user.movePreProcess(move);
                }
                moveResult = move.process(
                    this,
                    user,
                    target
                );
                if(moveResult.failed === true) {
                    moveResult = {
                        text: "but it failed"
                    }
                }
            }
            user.lastMove = move.name;
            if(moveResult.text) {
                this.showText(
                    moveResult.text,0,
                    this.getTextDuration(moveResult.text),
                    callback
                );
            } else if(callback) {
                callback(moveResult);
            }
        });

    }

    this.getTextDuration = text => {
        return 1000 + (text.split(" ").length * 200);
    }

    this.playerMove = move => {
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
        renderer.disablePlayerInputs();
    }

    this.elfMove = () => {
        let move;
        if(!this.elf.getMove) {
            move = moves["nothing"];
        } else {
            move = this.elf.getMove(this);
        }
        this.genericMove(
            move,
            this.elfBattleObject,
            this.playerBattleObject,
            () => {
                if(!this.playerHasDied) {
                    let elfSpeech = null;
                    if(this.elf.getSpeech) {
                        elfSpeech = this.elf.getSpeech(this);
                    }
                    if(elfSpeech !== null) {
                        this.showElfSpeech(
                            elfSpeech,0,
                            this.getTextDuration(elfSpeech) * 1.33,
                            this.returnInput
                        );
                    } else {
                        this.returnInput();
                    }
                } else {
                    this.returnInput();
                }
            }
        );
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
                setTimeout(()=>{
                    this.elfSpeech = null;
                    renderer.moveElf(80,0.5);
                    if(callback) {
                        callback();
                    }
                },duration);
            }
        }
        if(delay) {
            setTimeout(innerMethod,delay);
        } else {
            innerMethod();
        }
    }

    this.turnNumber = 0;

    this.returnInput = () => {
        if(this.elfHasDied) {
            this.elfDiedMethod();
        } else if(this.playerHasDied) {
            this.playerDiedMethod();
        } else {
            const endCallback = () => {
                if(this.elfHasDied) {
                    this.elfDiedMethod();
                } else if(this.playerHasDied) {
                    this.playerDiedMethod();
                } else {
                    this.turnNumber++;
                    renderer.enablePlayerInputs();
                }
            }
            if(this.globalBattleState.postTurnProcess !== null) {
                const turnProcessResult = this.globalBattleState.postTurnProcess(this);
                if(turnProcessResult.text) {
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

    this.bottomMessage = null;

    if(this.elf.startText) {
        renderer.playerInputs = this.elf.playerMoves;
        const endMethod = !this.elf.startSpeech?
            renderer.enablePlayerInputs: 
            () => {
                this.showElfSpeech(
                    this.elf.startSpeech,
                    0,this.getTextDuration(this.elf.startSpeech),
                    renderer.enablePlayerInputs
                );
            }
        this.showText(
            this.elf.startText,0,
            500+this.getTextDuration(this.elf.startText),
            endMethod
        );
    } else {
        const startEnd = () => {
            renderer.playerInputs = this.elf.playerMoves;
            renderer.enablePlayerInputs();
        }
        if(this.elf.startSpeech) {
            this.showElfSpeech(
                this.elf.startSpeech,0,
                500+this.getTextDuration(this.elf.startSpeech),
                startEnd
            );
        } else {
            startEnd();
        }
    }


}
