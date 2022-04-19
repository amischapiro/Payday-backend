const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId;
const colors = require('colors')
const fs = require('fs')

async function query(userId) {
    try {
        const collection = await dbService.getCollection('board');
        const boards = await collection.find({ 'createdBy._id': userId }).toArray() || [];
        const boardsHeaders = boards.map(board => {
            const { _id, title } = board
            return { _id, title }
        })
        return boardsHeaders;
    } catch (err) {
        logger.error('cannot find boards', err);
        throw err;
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board');
        const board = collection.findOne({ '_id': ObjectId(boardId) });
        return board;
    } catch (err) {
        logger.error(`while looking for board ${boardId}`, err);
        throw err;
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board');
        await collection.deleteOne({ '_id': ObjectId(boardId) });
        return boardId;
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err);
        throw err;
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('board')
        const { insertedId } = await collection.insertOne(board)
        const newBoardId = insertedId.toString()
        const addedBoard = await getById(newBoardId)
        return addedBoard
    } catch (err) {
        logger.error('cannot add board', err);
        throw err;
    }
}

async function update(board) {
    try {
        let id = ObjectId(board._id);
        delete board._id;
        const collection = await dbService.getCollection('board');
        await collection.updateOne({ "_id": id }, { $set: { ...board } });
        return board;
    } catch (err) {
        logger.error(`cannot update board ${board}`, err);
        throw err;
    }
}



module.exports = {
    query,
    getById,
    remove,
    add,
    update,
}