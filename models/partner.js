const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        required: false
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;