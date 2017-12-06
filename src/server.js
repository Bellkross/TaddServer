var sqlite = require('./sqlite');
var roomID;
var roomName, roomPass;
var taskID;
var text, creator, state;
var data;

roomName = `room`;
roomPass = roomName;
sqlite.createRoom(roomName, roomPass, () => {
    console.log(`${roomName} created with password: ${roomPass}`);

    roomID = 1;
    text = `New task for ${roomName}`;
    creator = `Bellkross`;
    sqlite.addTask(roomID, text, creator, () => {
        console.log(`Task ${text} created from: ${creator}`);

        taskID = 1;
        state = 1;
        sqlite.setTaskState(taskID, state, () => {
            console.log(`Task ${taskID} state modified from ${(taskID + 1) % 2} to ${taskID}`);

            taskID = 1;
            sqlite.removeTask(taskID, () => {
                console.log(`Task ${taskID} removed`);
                roomID = 1;
                text = `New task for ${roomName}`;
                creator = `Bellkross`;
                sqlite.addTask(roomID, text, creator, () => {
                    console.log(`Task ${text} created from: ${creator}`);

                    sqlite.getLastRoom((lastRoom) => {
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
                                            data += `\n`;
                                            console.log(data);
                                        });

                                    } else {
                                        data += `[];\n`
                                        console.log(data);
                                    }
                                });
                            });
                        }
                    });
                    //end of getLastRoom
                });
                //end of add task 2
            });
            //end of remove Task
        });
        //end of set task
    });
    //end of addTask
});
//end of createRoom