const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return typeof v === 'string' && v.endsWith('@mlrit.ac.in');
            },
            message: 'Email must be from MLRIT domain'
        }
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['student','admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);