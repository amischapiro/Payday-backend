const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId
const colors = require('colors')

async function query(skip = 0, limit = 40, boardId, storyId) {

    let critirea = {}
    if (!storyId) critirea = { "board._id": boardId }
    else critirea = { "story.id": storyId, "board._id": boardId }

    try {
        console.log(colors.brightGreen.underline('critirea'), colors.brightMagenta(critirea))
        console.log(colors.brightGreen.underline('skip'), colors.brightMagenta(skip))
        console.log(colors.brightGreen.underline('limit'), colors.brightMagenta(limit))

        const collection = await dbService.getCollection('activity')
        const activities = await collection.find(critirea).sort({ createdAt: -1 }).skip(+skip).limit(+limit).toArray()
        console.log(colors.brightGreen.underline('activities.length'), colors.brightMagenta(activities.length))
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
        console.log(colors.brightGreen.underline('acticity'), colors.brightMagenta(acticity))
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
        console.log(colors.brightGreen.underline('insertedId'), colors.brightMagenta(insertedId))
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

module.exports = {
    query,
    getByid,
    add,
    update,
}
