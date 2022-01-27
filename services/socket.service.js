const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null;
var gSocketBySessionIdMap = {};

function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })

    gIo.on('connection', socket => {
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
    );
    gIo.on('connection', (socket) => {
        console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID);
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket;
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', (socket) => {
            // console.log('Someone disconnected');
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null;
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        socket.on('chat newMsg', msg => {
            console.log('Emitting Chat msg', msg);
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        // socket.on('user-watch', userId => {
        //     socket.join('watching:' + userId)
        // })
        // socket.on('set-user-socket', userId => {
        //     logger.debug(`Setting (${socket.id}) socket.userId = ${userId}`)
        //     socket.userId = userId
        // })
        // socket.on('unset-user-socket', () => {
        //     delete socket.userId
        // })

        socket.on('join new board', (boardId) => {
            console.log('socketService joining board', boardId);
            // if (socket.myBoard === boardId) return;
            if (socket.myBoard) {
                console.log('42 * socket will LEAVE socket.myBoard =', socket.myBoard);
                socket.leave(socket.myBoard);
            }
            socket.join(boardId);
            logger.debug('Session ID is', socket.handshake.sessionID);
            socket.myBoard = boardId;
            console.log(`48 *socket will JOIN socket.myBoard`, socket.myBoard);
        });

        /* 
            After board being updated, emits this event that is heard in 
            Heard in boardApp which causes a new loadBoard.       
        */
        socket.on('board updated', (boardId) => {
            /* 
            We first print which board was updated. This is coming from board actions.
            We then print which board the socket is listening to, its sockt.myBoard.
            We then emit that a board was updated to all listeners of the same boardId, 
            which is their socket.myBoard value again. They get it in their cdm 'join new board'
            it sometimes happens that socket.myBoard is undefines. Then we need to shut 
            down the server, start it again, refresh both pages of the browser and try again. 
            */
            console.log('BE socket heard that boardId ', boardId, 'was updated');
            console.log('socket.myBoard when hearing \'board updated\' =', socket.myBoard);
            socket.to(socket.myBoard).emit('board was updated', boardId);
        });
    });
}

function emitToAll({ type, data, room = null }) {
    if (room) gIo.to(room).emit(type, data);
    else gIo.emit(type, data);
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data);
}

// Send to all sockets BUT not the current socket
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore();
    const { sessionId } = store;
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store');
    const excludedSocket = gSocketBySessionIdMap[sessionId];
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map');
    if (room) excludedSocket.broadcast.to(room).emit(type, data);
    else excludedSocket.broadcast.emit(type, data);
}

module.exports = {
    connectSockets,
    emitToAll,
    broadcast,
};