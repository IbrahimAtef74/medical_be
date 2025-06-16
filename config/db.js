const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`.red.bold);
    process.exit(1); // يوقف التطبيق تماماً إذا فشل الاتصال
  }
};

module.exports = connectDB;