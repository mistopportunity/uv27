"use strict";
const moves = {
    "nothing": {   
        type: "self",
        name: "nothing",
        process: () => {
            return {
                text: "nothing happened"
            }
        }
    },
    "disable": {
        type: "target",
        name: "disable",
        process: (sequencer,user,target) => {
            if(target.lastMove === null) {
                return {
                    failed: true
                }
            } else {
                if(target.disabledMoves[target.lastMove]) {
                    return {
                        text: `but ${target.lastMove} is already disabled`
                    }
                } else {
                    target.disabledMoves[target.lastMove] = true;
                    return {
                        text: target.isPlayer ?
                            `your ${target.lastMove} got disabled`:
                            `${target.name}'${
                                !target.name.endsWith("s")?"s":""
                            } ${target.lastMove} got disabled`
                    }
                }
            }
        }
    },
    "also nothing":{
        type: "target",
        name: "also nothing",
        process: () => {
            return {
                text: "*crickets*"
            }
        }
    },
    "cry": {
        type: "self",
        name: "cry",
        process: (sequencer,user) => {
            const animation = user.isElf ? {name:"crying",persist:true} : null;
            if(user.state.isLit) {
                const wasCrying = user.state.isCrying;
                user.state.isCrying = true;
                if(user.state.drunkCries >= 1) {
                    switch(user.state.drunkCries++) {
                        case 1:
                            if(user.state.isSuperLit) {
                                return {
                                    events: [
                                        {
                                            text: `${user.name} ${user.isPlayer ? "are" : "is"} really hammered`,
                                            animation:animation
                                        },
                                        {
                                            text: "the narrator looks intimidated"
                                        },
                                        {
                                            text: `*something slurred too hard to narrate*`
                                        }
                                    ]
                                }
                            } else {
                                return {
                                    events: [
                                        {
                                            text: "this might go on for a while",
                                            animation:animation
                                        },
                                        {
                                            text: `*something about ${user.isPlayer ? "an ex-wife" : "santa"} is brought up*`
                                        }
                                    ]
                                }                                
                            }
                        case 2:
                            if(user.state.isSuperLit) {
                                return {
                                    events: [
                                        {
                                            text: "who needs therapy",
                                            animation:animation
                                        },
                                        {
                                            text: "*the angry banter continues*"
                                        },
                                        {
                                            text: `this is cheaper anyways`
                                        },
                                        {
                                            text: `*the sobbing continues*`
                                        }
                                    ]
                                }
                            } else {
                                return {
                                    events: [
                                        {
                                            text: "the patheticness continues",
                                            animation:animation
                                        },
                                        {
                                            text: `*${user.isPlayer ? "childhood" : "elf labor"} issues are ranted about*`
                                        }
                                    ]
                                }
                            }
                        default:
                        case 3:
                            user.state.isLit = false;
                            user.state.isSuperLit = false;
                            user.state.alchoholWarning = false;
                            user.state.drunkCries = 0;
                            return {
                                events: [
                                    {
                                        text: `so much crying washes away the alchohol`,
                                        animation:animation
                                    },
                                    {
                                        text: `${user.name} ${user.isPlayer ? "are" : "is"} now sober`
                                    }
                                ]
                            }
                    }
                } else {
                    user.state.drunkCries = 1;
                    if(user.isPlayer) {
                        return {
                            events: [
                                {
                                    text: user.wasCrying ? "the crying continues" : "the crying starts",
                                    animation:animation
                                },
                                {
                                    text: `${user.name} ${user.isPlayer ? "have" : "has"} a lot of emotions with booze`,
                                    animation:animation
                                }
                            ]
                        }
                    } else {
                        return {
                            text: `${user.name} ${wasCrying ? "cries" : "starts to cry"} with the booze`,
                            animation:animation
                        }
                    }
                }
            } else {
                let text = !user.state.isCrying ?
                `${user.name} ${user.isPlayer ? "are" : "is"} now crying`:
                `${user.name} continue${user.isElf ? "s" : ""} to cry`;

                user.state.isCrying = true;
                return {
                    text: text,
                    animation:animation
                }
            }
        }
    },
    "honorable suicide": {
        type: "self",
        name: "honorable suicide",
        process: (sequencer,user,target) => {
            if(target.name === "the boss elf") {
                sequencer.dropHealth(user,user.maxHealth-1);
            } else {
                sequencer.dropHealth(user,user.maxHealth);
            }
            return {
                text: `${user.name} made an honor bound choice`
            }
        }
    },
    "senseless murder": {
        type: "target",
        name: "senseless murder",
        process: (sequencer,user,target) => {
            if(target.name === "murder elf") {
                localStorage.setItem("pleadedGuilty",sequencer.playerBattleObject.state.guiltyCount);
                localStorage.setItem("pleadedNotGuilty",sequencer.playerBattleObject.state.notGuiltyCount);
            }
            if(target.name === "the boss elf") {
                sequencer.dropHealth(target,target.maxHealth-1);
            } else {
                sequencer.dropHealth(target,target.maxHealth);
            }
            return {
                text: `${target.name} got f****d up`
            }
        }
    },
    "decent punch": {
        type: "target",
        name: "decent punch",
        process: (sequencer,user,target) => {

            let animation = null;
            if(target.isElf) {
                animation = {name:"punch"};
            }

            let damage = 15;
            if(user.state.atePunchingVitamins) {
                damage += damage;
            }

            sequencer.dropHealth(target,damage);
            if(target.health > 0) {
                return {
                    text: `${target.name} might need some ice`,
                    animation:animation
                }
            } else {
                return {
                    text: `${target.name} didn't survive that`,
                    animation:animation
                }
            }
        }
    },
    "wimpy punch": {
        type: "target",
        name: "wimpy punch",
        process: (sequencer,user,target) => {

            let animation = null;
            if(target.isElf) {
                animation = {name:"punch"};
            }

            let damage = 10;
            if(user.state.atePunchingVitamins) {
                damage += damage;
            }

            sequencer.dropHealth(target,damage);
            if(target.health > 0) {
                return {
                    text: `${target.name} might cry now`,
                    animation:animation
                }
            } else {
                return {
                    text: `${target.name} got punched out`,
                    animation:animation
                }
            }
        }
    },
    "wimpier punch": {
        type: "target",
        name: "wimpier punch",
        process: (sequencer,user,target) => {

            let animation = null;
            if(target.isElf) {
                animation = {name:"punch"};
            }

            const responses = [
                ()=>`${target.name} look${target.isElf ?"s" : ""} confused`,
                ()=>`${target.name} think${target.isElf ?"s" : ""} ${user.name} held back`
            ];
            let damage = 5;
            if(user.state.atePunchingVitamins) {
                damage += damage;
            }
            sequencer.dropHealth(target,damage);
            if(target.health > 0) {
                return {
                    text: responses[Math.floor(Math.random() * responses.length)](),
                    animation:animation
                };
            } else {
                return {
                    text: "it was a knock out hit",
                    animation:animation
                }
            }
        }
    },
    "nutcracker": {
        type: "target",
        name: "nutcracker",
        process: (sequencer,user,target) => {
            if(target.state.squirrels >= 1) {
                if(target.isPlayer) {
                    return {
                        text: `but your squirrel${target.state.squirrels === 1 ? "" : "s"} protected you`
                    }
                } else {
                    return {
                        text: "but squirrels protect against this"
                    }
                }
            }
            sequencer.dropHealth(target,Math.floor(target.maxHealth * 0.25));
            if(target.health > 0) {
                return {
                    text: `${target.name} ${target.isPlayer ? "are" : "is"} in immeasurable pain`
                }
            } else {
                return {
                    text: `${target.name} tragically died`
                }
            }

        }
    },
    "i love santa": {
        type: "self",
        name: "i love santa",
        process: (sequencer,user) => {
            if(user.isElf) {
                sequencer.addHealth(user,user.maxHealth);
                return {
                    text: `${user.name} had their health restored`
                }
            } else {
                sequencer.dropHealth(user,user.maxHealth);
                return {
                    text: `${user.name} had their health drained`
                }
            }
        }
    },
    "band aid": {
        type: "self",
        name: "band aid",
        process: (sequencer,user) => {
            sequencer.addHealth(user,10);
            return {
                text: `${user.name} applied a band aid`
            }
        }
    },
    "band aid 2.0": {
        type: "self",
        name: "band aid 2.0",
        process: (sequencer,user) => {
            sequencer.addHealth(user,18);
            return {
                text: `${user.name} applied a slightly improved band aid`
            }
        }
    },
    "health swap": {
        type: "target",
        name: "health swap",
        process: (sequencer,user,target) => {
            let animation = null;
            if(user.name === "wizard elf" || target.name === "wizard elf") {
                animation = {name:"robeHealth"}
            }

            const userHealth = user.health;
            const targetHealth = target.health;
            if(userHealth === targetHealth) {
                return {
                    text: "but it had no effect"
                }
            } else if(userHealth < targetHealth) {
                const difference = targetHealth - userHealth;

                sequencer.addHealth(user,difference);
                sequencer.dropHealth(target,difference);
            } else {
                const difference = userHealth - targetHealth;

                sequencer.addHealth(target,difference);
                sequencer.dropHealth(user,difference);
            }
            return {
                text: `${user.name} and ${target.name} swapped health`,
                animation: animation
            }
        }
    },
    "protect": {
        type: "self",
        name: "protect",
        process: (sequencer,user) => {
            if(user.isElf) {
                return {
                    text: `but elves don't know how to do this`
                }
            }
            user.state.protectTurn = sequencer.turnNumber;
            user.state.isProtected = true;
            return {
                failed: false
            }
        }
    },
    "punching vitamins": {
        type: "self",
        name: "punching vitamins",
        process: (sequencer,user) => {
            if(user.state.atePunchingVitamins) {
                sequencer.dropHealth(user,user.maxHealth);
                return {
                    text: `but ${user.isPlayer ? "you" : "they"} didn't read the warning label`
                }
            }
            user.state.atePunchingVitamins = true;
            return {
                text: `${user.name} will have stronker punches now`
            }
        }
    },
    "player variant protection preprocessor": {
        name: "player variant protection preprocessor",
        process: () => {
            return {
                failed: true,
                text: "but you used it last turn"
            }
        }
    },
    "elf variant protection preprocessor": {
        process: () => {
            return {
                name: "elf variant protection preprocessor",
                failed: true,
                text: "but you are protected"
            }
        }      
    },
};

const shuffleArrangements = "012301320213023103120321103210231230120313201302201320312103213023012310302130123120310232103201";
function shuffleWithMask(items) {
    const arrangement = shuffleArrangements.substr(Math.floor(Math.random() * 24)*4,4);
    const shuffledItems = [];
    for(let i = 0;i<4;i++) {
        const item = items[i];
        const mask = arrangement[i];
        shuffledItems[mask] = item;
    }
    return shuffledItems;
}

function turboTextWordByWord(sequencer,text,postText=null,postSpeech=null) {
    const events = text.split(" ").map(word => {return{text:word}});
    events.push({
        text: postText,
        speech: postSpeech,
        action: () => {
            sequencer.disableTurboText();
        }
    });
    events[0].action = sequencer.enableTurboText;
    return events;
}

function getRandomSelections(options,selectionCount,selectionMapper) {

    const selections = new Array(selectionCount);

    for(let i = 0;i<selectionCount;i++) {
        const optionIndex = Math.floor(Math.random()*options.length);
        const option = options.splice(optionIndex,1);
        if(selectionMapper) {
            selections[i] = selectionMapper(option);
        } else {
            selections[i] = option;
        }
        
    }
    return selections;
}

function turboTextIncremental(sequencer,introText,text) {
    const events = [{
        text: introText
    },...text.split("").map((item,index,arr)=>{
        let text;
        if(index !== 0) {
            text = arr[index-1] + item;
        } else {
            text = arr[0];
        }
        arr[index] = text;
        return {text:text}
    })];
    const startTurboValue = sequencer.turboTextVelocity;
    events[1].action = () => sequencer.enableTurboText(40);
    events[events.length-1].action = () => {
        sequencer.disableTurboText();
        sequencer.turboTextVelocity = startTurboValue;
    };
    return events;
}

function getStaticRadioSet(options,questionID) {
    return getRadioSet(options,questionID,false);
}
function getRadioSet(options,questionID,randomize=true) {
    const moves = [];
    for(let i = 0;i<options.length;i++) {
        moves[i] = getOptionMove(options[i],questionID,i);
    }
    return randomize ? shuffleWithMask(moves) : moves;
}

function overb(object) {
    return object.isPlayer ? "are" : "is";
}
function oposv(object) {
    return object.isPlayer ? "your" : "their";
}

function getOptionMove(moveName,questionID,optionID) {
    return {
        name: moveName,
        type: "option",
        process: (sequencer,user) => {
            console.log(`Option '${moveName}' - ID '${optionID}' @ '${questionID}'`);
            user.state[questionID] = optionID;
            return {
                failed: false
            }
        }
    }
}
function getSelectionMove(name,...options) {
    const optionMovesDictionary = {};
    const justMoves = [];
    const optionMoves = options.forEach(optionMove => {
        const newObject = {
            move: {
                name: optionMove.name,
                type: "option",
                process: (sequencer,user) => {
                    user.state.option = optionMove.name;
                    sequencer.globalBattleState.endSelection = true;
                    return null;
                }
            },
            events: optionMove.events
        }
        optionMovesDictionary[optionMove.name] = newObject;
        justMoves.push(newObject.move);
    });
    return {
        move: {
            name: name,
            type: "interface",
            process: (sequencer,user) => {
                sequencer.globalBattleState.options = optionMovesDictionary;
                sequencer.updatePlayerMoves(justMoves);
                return null;
            }
        },
        optionMoves: optionMoves
    }
}
function selectionPostProcessor(sequencer) {
    if(sequencer.globalBattleState.endSelection) {
        const optionObject = sequencer.globalBattleState.options[
            sequencer.playerBattleObject.state.option
        ];
        let result = null;
        if(optionObject) {
            if(optionObject.events) {
                result = {
                    events: optionObject.events
                }
            } else {
                result = optionObject
            }
        }
        sequencer.playerBattleObject.state.option = null;
        sequencer.globalBattleState.endSelection = false;
        if(result !== null) {
            return result;
        }
    }
    return null;
}
function protectPreProcessPlayer(sequencer,move) {
    if(move.name === "protect") {
        if(!isNaN(sequencer.playerBattleObject.state.protectTurn)) {
            if(sequencer.turnNumber >= sequencer.playerBattleObject.state.protectTurn+2) {
                return move;
            } else {
                return moves["player variant protection preprocessor"];
            }
        } else {
            return move;
        }
    }
    return move;
}
function protectPreProcessElf(sequencer,move) {
    if(move.type === "target" && sequencer.playerBattleObject.state.isProtected &&
        sequencer.turnNumber == sequencer.playerBattleObject.state.protectTurn) {

        sequencer.playerBattleObject.state.isProtected = false;
        return moves['elf variant protection preprocessor'];
    }
    return move;
}
function addMove(move) {
    if(moves[move.name]) {
        console.error(`Error: Duplicated move name @ '${move.name}'!`);
        return;
    }
    moves[move.name] = move;
}
