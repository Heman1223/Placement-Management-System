const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    notes: [{
        content: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['interested', 'contacted', 'interviewing', 'offered', 'hired', 'rejected', 'not_interested'],
        default: 'interested'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    tags: [String],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index
shortlistSchema.index({ company: 1, student: 1 }, { unique: true });
shortlistSchema.index({ company: 1, status: 1 });
shortlistSchema.index({ student: 1 });

module.exports = mongoose.model('Shortlist', shortlistSchema);
