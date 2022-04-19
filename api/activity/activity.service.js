const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId

async function query(skip = 0, limit = 40, boardId, storyId) {

    let critirea = {}
    if (!storyId) critirea = { "board._id": boardId }
    else critirea = { "story.id": storyId, "board._id": boardId }

    try {
        const collection = await dbService.getCollection('activity')
        const activities = await collection.find(critirea).sort({ createdAt: -1 }).skip(+skip).limit(+limit).toArray()
        return activities
    } catch (err) {
        logger.error('Cannot get activities')
        throw err
    }
}


async function getByid(activityId) {
    try {
        const colletction = await dbService.getCollection('activity')
        const acticity = await colletction.findOne({ _id: ObjectId(activityId) })
        return acticity
    } catch (err) {
        logger.error('Cannot get activity by id ')
        throw err
    }
}

async function add(activity) {
    try {
        const collection = await dbService.getCollection('activity')
        const { insertedId } = await collection.insertOne(activity)
        return insertedId
    } catch (err) {
        logger.error('cannot add acticity', err);
        throw err;
    }
}


async function update(activity) {
    try {
        const collection = await dbService.getCollection('acticity')
        const { insertedId } = await collection.insertOne(activity)
        return insertedId
    } catch (err) {
        logger.error('cannot add acticity', err);
        throw err;
    }
}

async function removeBoardActivities(boardId) {
    try {
        const collection = await dbService.getCollection('activity')
        const { acknowledged } = await collection.deleteMany({ "board._id": boardId })
        console.log(acknowledged);
        return acknowledged
    } catch (err) {
        logger.error('Cannot remove activies', err)
        throw err
    }
}

module.exports = {
    query,
    getByid,
    add,
    update,
    removeBoardActivities
}
