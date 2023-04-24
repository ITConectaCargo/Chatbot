const serverless = require('serverless-http')
const express = require('express')

const app = express()

const token = process.env.TOKEN
app.get('/webhooks', (req, res) => {
    if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] == token) {
        res.send(req.query['hub.challenge']);
    } else { res.sendStatus(400); }
})
module.exports.handler = serverless(app);