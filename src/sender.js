var sqlite = require('./sqlite');
var roomID;
var roomName, roomPass;
var taskID;
var text, creator, state;
var data;
var output;
const ADD_ROOM_COMMAND = `1`;
const ADD_TASK_COMMAND = `2`;
const SET_TASK_STATE_COMMAND = `3`;
const REMOVE_TASK_COMMAND = `4`;
const GET_ALL_ROOMS_COMMAND = `7`;

exports.readCommand = (data, command, callback) => {
    //room
    var name, password;
    //task
    var roomID, text, creator, state;
    //for parsing
    var c1, c2, c3, c4, c5, d;
    switch (command) {
        case ADD_ROOM_COMMAND://1,name,password.
            c1 = data.toString().indexOf(',', 1);
            c2 = data.toString().indexOf(',', c1 + 1);
            d = data.toString().indexOf('.', c2 + 1);
            name = data.toString().substring(c1 + 1, c2);
            password = data.toString().substring(c2 + 1, d);
            createRoom(name, password, () => (getRooms((dbData) => callback(dbData))));
            break;
        case ADD_TASK_COMMAND://2,roomID,text,creator.
            c1 = data.toString().indexOf(',', 1);
            c2 = data.toString().indexOf(',', c1 + 1);
            c3 = data.toString().indexOf(',', c2 + 1);
            c4 = data.toString().indexOf(',', c3 + 1);
            d = data.toString().indexOf('.', c4 + 1);
            roomID = data.toString().substring(c1 + 1, c2);
            text = data.toString().substring(c2 + 1, c3);
            creator = data.toString().substring(c3 + 1, d);
            addTask(roomID, text, creator, () => (getRooms((dbData) => callback(dbData))));
            break;
        case SET_TASK_STATE_COMMAND://3,taskID.
            c1 = data.toString().indexOf(',', 1);
            d = data.toString().indexOf('.', c1 + 1);
            taskID = data.toString().substring(c1 + 1, d);
            setTaskState(taskID, () => (getRooms((dbData) => callback(dbData))));
            break;
        case REMOVE_TASK_COMMAND://4,taskID.
            c1 = data.toString().indexOf(',', 1);
            d = data.toString().indexOf('.', c1 + 1);
            taskID = data.toString().substring(c1 + 1, d);
            removeTask(taskID, () => (getRooms((dbData) => callback(dbData))));
            break;
        case GET_ALL_ROOMS_COMMAND://7
            getRooms((dbData) => callback(dbData));
            break;
    }
};

function removeTask(taskID, callback) {

    sqlite.removeTask(taskID, () => {
        console.log(`task #${taskID} removed`);
        output = `${REMOVE_TASK_COMMAND}${taskID}.` + `\n`;
        callback();
    });

};

function setTaskState(taskID, callback) {
    sqlite.setTaskState(taskID, (state) => {
        if (state) {
            console.log(`new state of task #${taskID} = ${state}`);
            output = `${SET_TASK_STATE_COMMAND}${taskID},${state}.` + `\n`;
        }
        callback();
    });
};

function addTask(roomID, text, nameOfCreator, callback) {
    sqlite.addTask(roomID, text, nameOfCreator, () => {
        sqlite.getLastTask((last) => {
            output = `${ADD_TASK_COMMAND}${roomID},${text},${nameOfCreator},${last}.` + `\n`;
            console.log(output);
            console.log(`Task #${last}: ${text} created by ${nameOfCreator} from room #${roomID}.`);
            callback();
        });
    });
};

function createRoom(name, password, callback) {
    sqlite.createRoom(name, password, () => {
        sqlite.getLastRoom((last) => {
            output = `${ADD_ROOM_COMMAND}${name},${password},${last}.` + `\n`;
            console.log(output);
            console.log(`Created room: '${name}' with password: '${password}' with ID: '${last}'.`);
            callback();
        });
    });

};

function getRooms(callback) {
    sqlite.getLastRoom((lastRoom) => {
        console.log(`last room # = ${lastRoom} from getRooms`);
        if (lastRoom != -1) {
            sqlite.getRooms((rooms) => {

                data = `[`;
                rooms.forEach((room) => {
                    if (room.ROOM_ID == lastRoom) {
                        data += `{"id":${room.ROOM_ID},"name":'${room.NAME}',"pass":'${room.PASSWORD}'}];`;
                    } else {
                        data += `{"id":${room.ROOM_ID},"name":'${room.NAME}',"pass":'${room.PASSWORD}'},`;
                    }
                });

                data += `&`;

                sqlite.getLastTask((lastTask) => {

                    if (lastTask != -1) {

                        data += `[`;

                        sqlite.getAllTasks((tasks) => {
                            tasks.forEach((task) => {
                                if (task.TASK_ID == lastTask) {
                                    data += `{"id":${task.TASK_ID},"text":'${task.TASK_TEXT}',"creator":'${task.TASK_NAME_OF_CREATOR}',`
                                        + `"state":${task.TASK_STATE},"fk":${task.FK_ROOM_ID}}];`;
                                } else {
                                    data += `{"id":${task.TASK_ID},"text":'${task.TASK_TEXT}',"creator":'${task.TASK_NAME_OF_CREATOR}',`
                                        + `"state":${task.TASK_STATE},"fk":${task.FK_ROOM_ID}},`;
                                }
                            });
                            data = `${GET_ALL_ROOMS_COMMAND}${data}`;
                            console.log(data);
//                            socket.write(`${GET_ALL_ROOMS_COMMAND}${data}`);
                            data += `\n`;
                            callback(data);
                        });

                    } else {
//                        socket.write(`${GET_ALL_ROOMS_COMMAND}${data}`);
                        data = `${GET_ALL_ROOMS_COMMAND}${data}`;
                        data += `[];`
                        console.log(data);
                        data += `\n`;
                        callback(data);
                    }
                });
            });
        }
    });
};