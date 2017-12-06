const sqlite3 = require('sqlite3').verbose();

var DB_NAME = "TASKS_ADD_DB";

var ROOM_TABLE_NAME = "ROOM";

var ROOM_ID = "ROOM_ID";
var ROOM_NAME = "NAME";
var ROOM_PASSWORD = "PASSWORD";

var TASK_TABLE_NAME = "TASK";

var TASK_ID = "TASK_ID";
var FK_ROOM_ID = "FK_ROOM_ID";
var TASK_TEXT = "TASK_TEXT";
var TASK_NAME_OF_CREATOR = "TASK_NAME_OF_CREATOR";
var TASK_STATE = "TASK_STATE";

var db = new sqlite3.Database(`../db/${DB_NAME}.db`, () => {

    db.run(`CREATE TABLE IF NOT EXISTS ${ROOM_TABLE_NAME} (` +
        `${ROOM_ID} INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `${ROOM_NAME} TEXT NOT NULL,` +
        `${ROOM_PASSWORD} TEXT NOT NULL` +
        `);`);

    db.run(`CREATE TABLE IF NOT EXISTS ${TASK_TABLE_NAME} (` +
        `${TASK_ID} INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `${TASK_TEXT} TEXT NOT NULL,` +
        `${TASK_NAME_OF_CREATOR} TEXT NOT NULL,` +
        `${TASK_STATE} INTEGER NOT NULL,` +
        `${FK_ROOM_ID} INTEGER NOT NULL,` +
        `FOREIGN KEY (${FK_ROOM_ID}) REFERENCES ${ROOM_TABLE_NAME}(${ROOM_ID})` +
        `);`);

    db.close();
});
var sql;
var db;
var lastTask = -1;

//create room, command = 1
exports.createRoom = (name, password, callback) => {
    sql = `INSERT INTO ${ROOM_TABLE_NAME} (${ROOM_NAME},${ROOM_PASSWORD}) ` +
        `VALUES ('${name}','${password}');`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`, () => db.run(sql, () => db.close(() => callback())));
};
//add task, command = 2
exports.addTask = (roomID, text, nameOfCreator, callback) => {
    sql = `INSERT INTO ${TASK_TABLE_NAME} (${FK_ROOM_ID},${TASK_TEXT},${TASK_NAME_OF_CREATOR},` +
        `${TASK_STATE}) VALUES ('${roomID}','${text}','${nameOfCreator}','0');`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`,() => db.run(sql,() => db.close(() => callback())));
};
//set task state, command = 3
exports.setTaskState = (taskID, state, callback) => {
    sql = `UPDATE ${TASK_TABLE_NAME} SET ${TASK_STATE} = '${state}' WHERE ${TASK_ID} = ${taskID};`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`,() => db.run(sql,() => db.close(() => callback())));
};
//remove task, command = 4
exports.removeTask = (taskID, callback) => {
    sql = `DELETE FROM ${TASK_TABLE_NAME} WHERE ${TASK_ID} = ${taskID};`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`,() => db.run(sql,() => db.close(() => callback())));
};
//get all rooms, command 5
exports.getRooms = (callback) => {
    sql = `SELECT * FROM ${ROOM_TABLE_NAME};`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`, () => db.all(sql, [], (err, rooms) => {
        if(err)
            console.log(err.toString());
        db.close(() => callback(rooms));
    }));
};
exports.getRoomTasks = (roomID, callback) => {
    sql = `SELECT * FROM ${TASK_TABLE_NAME} WHERE ${FK_ROOM_ID} = '${roomID}'`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`, () => db.all(sql, [], (err, tasks) => {
        if(err)
            console.log(err.toString());
        db.close(() => callback(tasks));
    }));
};
exports.getAllTasks = (callback) => {
    sql = `SELECT * FROM ${TASK_TABLE_NAME};`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`);
    db.all(sql, [], (err, tasks) => {
        db.close(()=>callback(tasks));
    });
};
exports.getLastTask = (callback) => {
    sql = `SELECT ${TASK_ID} FROM ${TASK_TABLE_NAME};`;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`,() => {
        db.all(sql, [], (err, tasks) => {
            db.close(() => {
                if(tasks.length!=0) {
                    lastTask = tasks[tasks.length - 1].TASK_ID;
                } else {
                    lastTask = -1;
                }
                callback(lastTask);
            });
        });
    });
};
exports.getLastRoom = (callback) => {
    sql = `SELECT ${ROOM_ID} FROM ${ROOM_TABLE_NAME};`;
    lastTask = -1;
    db = new sqlite3.Database(`../db/${DB_NAME}.db`, () => {
        db.all(sql, [], (err, rooms) => {
            if (err) {
                console.log(err.toString());
            }
            db.close(() => {
                if(rooms.length!=0){
                    lastTask = rooms[rooms.length - 1].ROOM_ID;
                } else {
                    lastTask = -1;
                }
                callback(lastTask);
            });
        });
    });
};