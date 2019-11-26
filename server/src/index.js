"use strict";
var http = require('http')
var express = require('express')
var path = require('path')
var restify = require('express-restify-mongoose')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cors = require('cors')
var mongoose = require('mongoose')
var helmet = require('helmet')


var mongoHost = process.env.MONGO_HOST

mongoose.connect('mongodb://' + mongoHost + '/todos', {
  // useMongoClient: true
})

var ToDoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
})
var ToDoModel = mongoose.model('ToDo', ToDoSchema)

var app = express()
app.use(cors());

app.use(helmet.contentSecurityPolicy({
  directives: {
    // defaultSrc: ["'self'", "data:"]
    defaultSrc: ["*"]
  }
}));

app.set('port', process.env.PORT || 3000)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('X-HTTP-Method-Override'))
restify.serve(app, ToDoModel, {
  // exclude: 'text,done'
})

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})
