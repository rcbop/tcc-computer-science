"use strict";
var http = require('http')
var express = require('express')
var path = require('path')
var restify = require('express-restify-mongoose')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cors = require('cors')
var mongoose = require('mongoose')
var morgan = require('morgan')

var mongoHost = process.env.MONGO_HOST

mongoose.connect('mongodb://' + mongoHost + '/todos')

var ToDoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
})
var ToDoModel = mongoose.model('todo', ToDoSchema)

var app = express()
var router = express.Router()

router.use(bodyParser.json())
router.use(methodOverride())
router.use(morgan('combined'));
router.use(cors());

restify.serve(router, ToDoModel)
router.use('/', router);

app.set('port', process.env.PORT || 3000)

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
  console.log('displaying routes');
  console.log(router.stack);
})
