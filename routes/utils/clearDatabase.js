require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('../../models/bus');


const clearDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('Clearing Bus collection...');
        await Bus.deleteMany({}); // Remove all documents from the Bus collection

        console.log('Bus collection cleared');
        process.exit();
    } catch (error) {
        console.error('Failed to clear database:', error);
        process.exit(1);
    }
};

clearDatabase();
