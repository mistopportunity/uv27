"use strict";
addMove({
    name: "glitch punch",
    type: "target",
    process: (sequencer,user,target) => {
        if(user.state.dimensionIndex !== target.state.dimensionIndex) {
            return {
                failed: true,
                text: "but this is the wrong dimension"
            }
        }
        if(target.state.phasedOut !== user.state.phasedOut) {
            const whomstve = target.state.phasedOut ? target : user;
            return {
                failed: true,
                text: `but ${whomstve.name} ${overb(whomstve)} out of phase`
            }
        }
        if(user.state.ateElfmartVitamins || target.state.ateElfmartVitamins) {
            const events = sequencer.globalBattleState.ranGillsStuff ? [] : [
                {
                    text: "ever since those vitamins..."
                },
                {
                    text: "no one has fists anymore"
                },
                {
                    text: "they only have fish fins"
                }
            ];
            events.push({
                text: `${user.name} tried to splash ${target.name}`
            });
            events.push({
                text: "but nothing happened"
            });
            sequencer.globalBattleState.ranGillsStuff = true;
            return {
                events: events
            }
        }
        if(Math.random() > 0.5) {
            return {
                failed: true,
                text: "but it slipped through time itself"
            }
        } else if(Math.random() < 0.5) {
            return {
                text: "it went through a goat but it worked",
                action: () => target.dropHealth(15),
                animation: target.isElf ? {name:"punch"}:null
            }
        } else {
            return {
                text: "but the fist went backwards",
                action: () => user.dropHealth(15),
                animation: user.isElf?{name:"punch"}:null
            }
        }
    }
});
addMove({
    name: "dimensional shift",
    type: "self",
    process: (sequencer,user) => {
        user.state.justJumped = true;

        user.state.dimensionIndex++;
        user.state.dimensionIndex %= sequencer.globalBattleState.dimensionCount;

        const dimensionText = `dimension ${user.state.dimensionIndex+1}`;
        user.subText[0] = dimensionText;
        return {
            text: `${user.name} entered ${dimensionText}`
        }
    }
});
addMove({
    name: "dimensional jump",
    type: "target",
    process: (sequencer,user,target) => {
        user.state.justJumped = true;
        user.state.dimensionIndex = target.state.dimensionIndex;
        const dimensionText = `dimension ${user.state.dimensionIndex+1}`;
        user.subText[0] = dimensionText;
        
        return {
            text: `${user.name} jumped to ${dimensionText}`
        }
    }
});
addMove({
    name: "trapezoid",
    type: "target",
    process: (sequencer,user,target) => {
        if(user.state.dimensionIndex !== target.state.dimensionIndex) {
            return {
                failed: true,
                text: "<error> - <dimension mismatch>"
            }
        }
        if(target.state.phasedOut !== user.state.phasedOut) {
            const whomstve = target.state.phasedOut ? target : user;
            return {
                failed: true,
                text: `but ${whomstve.name} ${overb(whomstve)} out of phase`
            }
        }
        target.dropHealth(24);
        return {
            text: `${target.name} got hit with an abject shape`
        }
    }
});
addMove({
    name: "eternal darkness",
    type: "self",
    process: (sequencer,user) => {
        return {
            events: [
                {
                    text: "a cute unicorn showed up"
                },
                {
                    text: `it gave ${user.name} a friendly kiss`,
                    action: () => user.addHealth(25)
                },
                {
                    text: "goodbye unicorn!"
                }
            ]
        }
    }
});
addMove({
    name: "quantum detangle",
    type: "target",
    process: (sequencer,user,target) => {
        if(user.state.dimensionIndex !== target.state.dimensionIndex) {
            return {
                failed: true,
                text: "<error> - <dimension mismatch>"
            }
        }
        if(target.state.phasedOut !== user.state.phasedOut) {
            const whomstve = target.state.phasedOut ? target : user;
            return {
                failed: true,
                text: `but ${whomstve.name} ${overb(whomstve)} out of phase`
            }
        }
        const events = [];
        sequencer.enableTurboText();
        for(let ow = 0;ow<16;ow++) {
            events.push({
                action: () => target.dropHealth(2),
                text: `let ow = ${ow}`
            });
        }
        events[events.length-1].action = () => {
            target.dropHealth(2);
            sequencer.disableTurboText();
        }
        events.push({
            text: "no one knows what just happened"
        });
        return {
            events: events
        }
    }
});
addMove({
    name: "multiverse",
    type: "target",
    process: (sequencer,user,target) => {
        if(user.state.dimensionIndex !== target.state.dimensionIndex) {
            if(target.state.phasedOut || user.state.phasedOut) {
                sequencer.globalBattleState.transcendentalBoos = true;
                return {
                    failed: true,
                    text: `boos can now transcend dimensions`
                }
            }
            target.dropHealth(40);
            return {
                events: [
                    {
                        text: "the existential plane was crossed"
                    },
                    {
                        text: "<target received damage>"
                    }
                ]
            }
        } else {
            return {
                events: [
                    {
                        text: "but the target was already in this plane"
                    },
                    {
                        text: "this created a black hole",
                        action: () => rendererState.background = null
                    },
                    {
                        text: "a new message from 'magic eight ball'"
                    },
                    {
                        text: "<begin message>"
                    },
                    {
                        text: "'outlook not good'"
                    },
                    {
                        text: "<end messsage>"
                    },
                    {
                        text: "everyone got sucked into a black hole",
                        action: () => {
                            user.dropHealth(user.maxHealth);
                            target.dropHealth(target.maxHealth);
                        }
                    }
                ]
            }
        }
    }
});
const temporalPhaseText = "in temporal phase";
const ghostPhaseText = "in ghost phase";
addMove({
    name: "phase shift",
    type: "self",
    process: (sequencer,user,target) => {
        if(user.state.phasedOut) {
            user.state.phasedOut = false;
            user.subText[1] = temporalPhaseText;
            return {
                events: [{text: `${user.name} phased into temporal space`}]
            }
        } else {
            user.state.phasedOut = true;
            user.subText[1] = ghostPhaseText;
            return {
                events: [{text: `${user.name} phased out of temporal space`}]
            }
        }
    }
});
addMove({
    name: "ghost buster",
    type: "target",
    process: (sequencer,user,target) => {
        if(user.state.dimensionIndex === target.state.dimensionIndex && target.phasedOut) {
            if(Math.random() > 0.5) {
                target.dropHealth(target.maxHealth);
                return {
                    text: `${target.name} got ghost busted`
                }
            } else {
                target.dropHealth(10);
                return {
                    text: `${target.name} resisted capture`
                }
            }
        }
        if(user.state.phasedOut) {
            user.dropHealth(user.maxHealth);
            return {
                text: `but ${user.name} ${user.isPlayer ? "were" : "was"} a ghost`
            }
        } else if(user.state.dimensionIndex === target.state.dimensionIndex) {
            if(target.state.phasedOut) {
                if(Math.random() > 0.5) {
                    target.dropHealth(target.maxHealth);
                    return {
                        text: `${target.name} got ghost busted`
                    }
                } else {
                    target.dropHealth(10);
                    return {
                        text: `${target.name} resisted capture`
                    }
                }
            } else {
                return {
                    text: `but ${user.name} dialed the wrong number`
                }
            }
        } else {
            return {
                failed: true,
                text: "<error> - <dimension mismatch>"
            }            
        }
    }
});
addMove({
    name: "punching vitamins?",
    type: "self",
    process: (sequencer,user) => {
        user.state.ateElfmartVitamins = true;
        return {
            text: "but they're elfmart brand vitamins"
        }
    }
});
addMove({
    name: "confusion",
    type: "target",
    process: (sequencer,user) => {
        return {
            events: [
                ...turboTextIncremental(sequencer,"what? are you confused?","l i f e  i s  c o n f u s i o n"),
                ...turboTextIncremental(sequencer,"*the phone rings*","w h a t  i s  y o u r  s u b s t a n c e?"),
                {
                    text: "hello?"
                },
                {
                    text: "operator?"
                },
                {
                    text: "<goodbye>"
                },
                {
                    text: "*clicks*"
                }
            ]
        }
    }
});

addMove({
    name: "rebirth",
    type: "self",
    process: (sequencer,user) => {
        user.addHealth(user.maxHealth);
        return {
            text: `${user.name} was reborn`
        }
    }
});
addMove({
    name: "boo",
    type: "target",
    process: (sequencer,user,target) => {
        if(user.state.dimensionIndex !== target.state.dimensionIndex && !sequencer.globalBattleState.transcendentalBoos) {
            return {
                failed: true,
                text: "<error> - <dimension mismatch>"
            }
        }
        if(user.state.phasedOut) {
            target.dropHealth(10);
            target.state.isStartled = true;
            return {
                text: `${target.name} got frightened`
            }
        } else {
            return {
                failed: true,
                text: `but ${user.name} ${overb(user)}n't a ghost`
            }
        }
    }
});
function PhaseShiftElf() {
    const getAnimalMove = name => {
        return {
            name: name,
            type: "self",
            process: (sequencer,user) => {
                return {
                    text: `a ${name}? huh. weird.`
                }
            }
        }
    }
    addMove(getAnimalMove("lizard"));
    addMove(getAnimalMove("hungry hungry potato"));

    const playerMoveSetsByDimensions = [
        [
            moves["glitch punch"],
            moves["dimensional shift"],
            moves["ghost buster"],
            moves["boo"]
        ],
        [
            moves["glitch punch"],
            moves["dimensional shift"],
            moves["phase shift"],
            moves["punching vitamins?"]
        ],
        [
            moves["glitch punch"],
            moves["dimensional shift"],
            moves["multiverse"],
            moves["health swap"]
        ]
    ];

    this.name = "phase shift elf";
    this.background = "background-5";
    this.backgroundColor = "white";
    this.foregroundColor = "red";
    this.health = 100;

    this.song = "phase_loop";
    this.songIntro = "phase_intro";

    this.getSpeech = sequencer => {
        if(sequencer.turnNumber === 0) {
            return {
                text: "time is\n\ni r r e l e v a n t"
            }
        }
        if(sequencer.playerBattleObject.lastMove === "phase shift" && sequencer.playerBattleObject.state.phasedOut) {
            return {
                text: "what scares a ghost\nthe most?\n\nat most it's\njust another ghost"
            }
        }
        return null;
    };

    this.startText = "everyone's moves are bound by their dimension";

    this.startSpeech = {
        text: "a lone ghost in a vacuum\ndestroys itself\n\nwell played player"
    };

    this.getLoseSpeech = sequencer => {
        return {text:"welcome to hell.\n\nis this the end\nor is it only just\nthe beginning?"}
    };
    this.getWinSpeech = sequencer => {
        return {text:"welcome to the void\nthere's only one way out"}
    };

    this.playerMoves = playerMoveSetsByDimensions[0];
    this.getMove = sequencer => {
        if(sequencer.elfBattleObject.health <= 25) {
            return moves["rebirth"];
        }
        if(sequencer.elfBattleObject.state.isStartled) {
            return moves["ghost buster"];
        }
        if(sequencer.playerBattleObject.state.dimensionIndex !== sequencer.elfBattleObject.state.dimensionIndex) {
            if(!sequencer.playerBattleObject.state.justJumped) {
                return moves["dimensional jump"];
            }
            const moveSets = [
                ["phase shift"],
                ["hungry hungry potato","confusion"],
                ["multiverse","eternal darkness"],
            ];
            const moveSet = moveSets[sequencer.elfBattleObject.state.dimensionIndex];
            const moveName = moveSet[sequencer.turnNumber % moveSet.length];
            const move = moves[moveName];
            return move;
        } else {
            if(sequencer.playerBattleObject.phasedOut && !sequencer.elfBattleObject.phasedOut && Math.random() > 0.5) {
                return moves["ghost buster"];
            }
            const moveSets = [
                ["quantum detangle","glitch punch","quantum detangle","phase shift",],
                ["confusion","trapezoid","hungry hungry potato","quantum detangle"],
                ["eternal darkness","trapezoid","glitch punch"],
            ];
            const moveSet = moveSets[sequencer.elfBattleObject.state.dimensionIndex];
            const moveName = moveSet[sequencer.turnNumber % moveSet.length];
            const move = moves[moveName];
            return move;
        }
    };
    
    this.setup = sequencer => {
        sequencer.playerBattleObject.state.dimensionIndex = 0;
        sequencer.elfBattleObject.state.dimensionIndex = 0;

        sequencer.playerBattleObject.state.jumpCount = 0;
        sequencer.elfBattleObject.state.jumpCount = 0;

        sequencer.playerBattleObject.subText = ["dimension 1",temporalPhaseText];
        sequencer.elfBattleObject.subText = ["dimension 1",temporalPhaseText];

        sequencer.globalBattleState.dimensionCount = 3;

        sequencer.playerBattleObject.state.phasedOut = false;
        sequencer.elfBattleObject.state.phasedOut = false;
    };

    this.getDefaultGlobalState = () => {
        return {
            dimensionCount: 3,
            postTurnProcess: sequencer => {
                if(sequencer.playerBattleObject.state.justJumped) {
                    sequencer.updatePlayerMoves(playerMoveSetsByDimensions[
                        sequencer.playerBattleObject.state.dimensionIndex
                    ]);
                    sequencer.playerBattleObject.state.jumpCount++;
                }
                if(sequencer.elfBattleObject.state.justJumped) {
                    sequencer.playerBattleObject.state.jumpCount++;
                }
                sequencer.playerBattleObject.state.justJumped = false;
                sequencer.elfBattleObject.state.justJumped = false;

                sequencer.playerBattleObject.state.isStartled = false;
                sequencer.elfBattleObject.state.isStartled = false;
            }
        }
    }
}
