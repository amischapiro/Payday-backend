// const { instrument } = require("@socket.io/admin-ui");
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {

    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })

    gIo.on('connection', socket => {
        console.log('New socket', socket.id)
        socket.on('disconnect', () => {
            console.log('Someone disconnected')
        })

        socket.on('enter workspace', () => {
            if (socket.workspace === 'workspace') return
            socket.join('workspace')
            socket.workspace = 'workspace'
        })
        socket.on('update workspace', () => {
            console.log('Emitting workspace');
            socket.to('workspace').emit('workspace has updated')
        })

        socket.on('enter board', boardId => {
            if (socket.board === boardId) return;
            if (socket.board) {
                socket.leave(socket.board)
            }
            socket.join(boardId)
            socket.board = boardId
        })
        socket.on('update board', boardId => {
            _printSockets()
            socket.to(boardId).emit('board has updated', boardId)
        })
    })
    // instrument(gIo, {
    //     auth: false
    // });
}



async function broadcast({ type, data, room = null, userId }) {
    console.log('BROADCASTING', JSON.stringify(arguments));
    const excludedSocket = await _getUserSocket(userId)
    if (!excludedSocket) {
        logger.debug('Shouldnt happen, socket not found')
        _printSockets();
        return;
    }
    logger.debug('broadcast to all but user: ', userId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId == userId);
    return socket;
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}

async function _printSockets() {
    const sockets = await _getAllSockets();
    console.log(`Sockets: (count: ${sockets.length}):`);
    sockets.forEach(_printSocket);
}
function _printSocket(socket) {
    console.log('socket.service.js 💤 85: socket.rooms', socket.rooms);
}


module.exports = {
    connectSockets,
}