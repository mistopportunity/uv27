const gamepadDeadzone = 0.5;
const deadzoneNormalizer = 1 / (1 - gamepadDeadzone);
const applyDeadZone = value => {
    if(value < 0) {
        value = value + gamepadDeadzone;
        if(value > 0) {
            value = 0;
        } else {
            value *= deadzoneNormalizer;
        }
    } else {
        value = value - gamepadDeadzone;
        if(value < 0) {
            value = 0;
        } else {
            value *= deadzoneNormalizer;
        }
    }
    return value;
}

const fakeButtonPressEvent = {pressed:true};
const buttonStates = {}, buttonRollverTimeout = 150, axisRolloverTimeout = 180;
const processButton = (name,action,endAction,button,timestamp,isAxis) => {
    if(button.pressed) {
        if(!buttonStates[name]) {
            buttonStates[name] = {timestamp:timestamp};
            action();
        } else if(timestamp >= buttonStates[name].timestamp + (isAxis ? axisRolloverTimeout : buttonRollverTimeout)) {
            buttonStates[name].timestamp = timestamp;
            action();
        }
    } else {
        if(buttonStates[name]) {
            endAction();
            delete buttonStates[name];
        }
    }
};
const leftBumperDown = ()=> {
    window.onkeydown(leftBumperCode);
};
const rightBumperDown = ()=> {
    window.onkeydown(rightBumperCode);
};
const aButtonDown = ()=> {
    window.onkeydown(aButtonCode);
};
const yButtonDown = ()=> {
    window.onkeydown(yButtonCode);
};
const bButtonDown = ()=> {
    window.onkeydown(bButtonCode);
};
const upButtonDown = ()=> {
    window.onkeydown(upButtonCode);
};
const downButtonDown = ()=> {
    window.onkeydown(downButtonCode);
};
const leftButtonDown = ()=> {
    window.onkeydown(leftButtonCode);
};
const rightButtonDown = ()=> {
    window.onkeydown(rightButtonCode);
};
const startButtonDown = ()=> {
    window.onkeydown(startButtonCode);
};
const leftBumperUp = ()=> {
    window.onkeyup(leftBumperCode);
};
const rightBumperUp = ()=> {
    window.onkeyup(rightBumperCode);
};
const aButtonUp = ()=> {
    window.onkeyup(aButtonCode);
};
const yButtonUp = ()=> {
    window.onkeyup(yButtonCode);
};
const bButtonUp = ()=> {
    window.onkeyup(bButtonCode);
};
const upButtonUp = ()=> {
    window.onkeyup(upButtonCode);
};
const downButtonUp = ()=> {
    window.onkeyup(downButtonCode);
};
const leftButtonUp = ()=> {
    window.onkeyup(leftButtonCode);
};
const rightButtonUp = ()=> {
    window.onkeyup(rightButtonCode);
};
const startButtonUp = ()=> {
    window.onkeyup(startButtonCode);
};

const leftBumperCode = {code:"LeftBumper"};
const rightBumperCode = {code:"RightBumper"};
const aButtonCode = {code:"Enter"};
const yButtonCode = {code:"KeyP"};
const bButtonCode = {code:"Escape"};
const upButtonCode = {code:"KeyW"};
const downButtonCode = {code:"KeyS"};
const leftButtonCode = {code:"KeyA"};
const rightButtonCode = {code:"KeyD"};
const startButtonCode = {code:"Enter"};

const processGamepad = gamepad => {

    processButton("LeftBumper",leftBumperDown,leftBumperUp,gamepad.buttons[4],gamepad.timestamp);
    processButton("RightBumper",rightBumperDown,rightBumperUp,gamepad.buttons[5],gamepad.timestamp);
    processButton("a",aButtonDown,aButtonUp,gamepad.buttons[0],gamepad.timestamp);
    processButton("y",yButtonDown,yButtonUp,gamepad.buttons[3],gamepad.timestamp);
    processButton("b",bButtonDown,bButtonUp,gamepad.buttons[1],gamepad.timestamp);
    processButton("up",upButtonDown,upButtonUp,gamepad.buttons[12],gamepad.timestamp);
    processButton("down",downButtonDown,downButtonUp,gamepad.buttons[13],gamepad.timestamp);
    processButton("left",leftButtonDown,leftButtonUp,gamepad.buttons[14],gamepad.timestamp);
    processButton("right",rightButtonDown,rightButtonUp,gamepad.buttons[15],gamepad.timestamp);
    processButton("start",startButtonDown,startButtonUp,gamepad.buttons[9],gamepad.timestamp);

    const leftXAxis = applyDeadZone(gamepad.axes[0]);
    const leftYAxis = applyDeadZone(gamepad.axes[1]);

    if(leftXAxis > 0) {
        processButton("leftXAxis",rightButtonDown,rightButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else if(leftXAxis < 0) {
        processButton("leftXAxis",leftButtonDown,leftButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else {
        if(buttonStates["leftXAxis"]) {
            leftButtonUp();
            rightButtonUp();
            delete buttonStates["leftXAxis"];
        }
    }
    if(leftYAxis > 0) {
        processButton("leftYAxis",downButtonDown,downButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else if(leftYAxis < 0) {
        processButton("leftYAxis",upButtonDown,upButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else {
        if(buttonStates["leftYAxis"]) {
            downButtonUp();
            upButtonUp();
            delete buttonStates["leftYAxis"];
        }
    }

    const rightXAxis = applyDeadZone(gamepad.axes[2]);
    const rightYAxis = applyDeadZone(gamepad.axes[3]);

    if(rightXAxis > 0) {
        processButton("rightXAxis",rightButtonDown,rightButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else if(rightXAxis < 0) {
        processButton("rightXAxis",leftButtonDown,leftButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else {
        if(buttonStates["rightXAxis"]) {
            leftButtonUp();
            rightButtonUp();
            delete buttonStates["rightXAxis"];
        }
    }
    if(rightYAxis > 0) {
        processButton("rightYAxis",downButtonDown,downButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else if(rightYAxis < 0) {
        processButton("rightYAxis",upButtonDown,upButtonUp,fakeButtonPressEvent,gamepad.timestamp,true);
    } else {
        if(buttonStates["rightYAxis"]) {
            downButtonUp();
            upButtonUp();
            delete buttonStates["rightYAxis"];
        }
    }
}