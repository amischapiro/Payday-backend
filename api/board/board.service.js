const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId;


async function query(userId) {
    try {
        // let criteria = {};
        // if (filterBy) criteria = _buildCriteria(filterBy);
        const collection = await dbService.getCollection('board');
        const boards = await collection.find({ 'createdBy._id': userId }).toArray() || [];
        const boardsHeadres = boards.map(board => {
            const { _id, title } = board
            return { _id, title }
        })
        return boardsHeadres;
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



function _buildCriteria(filterBy) {
    const { inStock, labels, name } = filterBy;
    let criteria = {};
    if (name) {
        criteria.name = { $regex: name, $options: 'i' };
    }
    if (inStock === 'inStock') {
        criteria.inStock = true;
    } else if (inStock === 'outofstock') {
        criteria.inStock = false;
    }
    if (labels.length) {
        criteria.labels = { $all: labels }
    }
    return criteria

}

// function _getFilteredBoards(Boards, filterBy) {
//     return boards.filter(board => {
//         return (board.name.toLowerCase().includes(filterBy.name.toLowerCase()) &&
//             (filterBy.inStock === 'all' || '' + board.inStock === filterBy.inStock) &&
//             _isLabelsMatch(board, filterBy.labels))
//     })
// }

// function _isLabelsMatch(board, filterLabels) {
//     if (!filterLabels) return true
//     console.log(filterLabels)
//     if (filterLabels.length === 1 && filterLabels[0] === '') return true
//     return filterLabels.every(label => board.labels.includes(label))
// }

module.exports = {
    query,
    getById,
    remove,
    add,
    update
}