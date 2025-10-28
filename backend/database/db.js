const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const dbConnect = async () => {
    try {
        const uri = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/oj-project';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB:', uri);
        console.log('Database name:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
module.exports = {dbConnect};