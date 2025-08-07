const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const dbName = 'yourdb';

async function mergeCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = await db.collection('users').find().toArray();
    for (const user of users) {
      // Remove _id to avoid duplicate key error, or handle as needed
      delete user._id;
      // Optionally, add a field to indicate origin
      user.migratedFrom = 'users';
      // Upsert by email to avoid duplicates
      await db.collection('customers').updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      );
    }
    console.log('Merge complete!');
  } finally {
    await client.close();
  }
}
mergeCollections();