const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    coordinator: String,
    registrations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    attendance: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            default: 'absent'
        }
    }]
});

module.exports = mongoose.model('Event', eventSchema);