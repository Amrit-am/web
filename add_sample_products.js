// Script to add 50 sample electronics products to MongoDB for testing
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://test:test123@test.kau1dag.mongodb.net/?retryWrites=true&w=majority&appName=test";
const client = new MongoClient(uri);

const sampleProducts = Array.from({ length: 50 }, (_, i) => ({
    name: `Test Electronic Product ${i + 1}`,
    price: (Math.random() * 100 + 10).toFixed(2),
    stock: Math.floor(Math.random() * 100) + 1,
    imageUrl: `https://source.unsplash.com/400x400/?electronics,gadget,tech,product,${i + 1}`,
    status: 'active',
    description: `Sample description for electronic product ${i + 1}.`,
}));

async function addProducts() {
    try {
        await client.connect();
        const db = client.db('test');
        const result = await db.collection('products').insertMany(sampleProducts);
        console.log(`Inserted ${result.insertedCount} products.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

addProducts();
