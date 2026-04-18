import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

async function clearProducts() {
  try {
    // 1. Connect to MongoDB using the URI from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB safely.');

    // 2. Delete all documents from the Product collection only
    // deleteMany({}) without filters deletes all documents in that specific collection
    const result = await Product.deleteMany({});
    
    // 3. Log the number of deleted documents
    console.log(`🗑️ Successfully deleted ${result.deletedCount} documents from the "products" collection.`);

  } catch (error) {
    console.error('❌ Error clearing the products collection:', error);
  } finally {
    // 4. Close the connection gracefully
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

clearProducts();
