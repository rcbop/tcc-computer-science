const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');
const TodoSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        // status: {
        //     type: String,
        //     required: false,
        //     enum: ['pending', 'complete', 'in progress', 'overdue'],
        //     default: 'pending',
        // },
        done: {
            type: Boolean,
            required: false
        } 
    },
    { minimize: false },
);
TodoSchema.plugin(timestamps);
TodoSchema.plugin(mongooseStringQuery);
const Todo = mongoose.model('Todo', TodoSchema);
module.exports = Todo;