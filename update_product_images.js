// Script to update all product images in MongoDB with Google image search URLs
const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://test:test123@test.kau1dag.mongodb.net/?retryWrites=true&w=majority&appName=test";
const client = new MongoClient(uri);

// Helper: Generate a Google image search URL for a product name
function getGoogleImageUrl(productName) {
    const query = encodeURIComponent(productName + ' electronics');
    // This is a search URL, not a direct image, but for demo/testing, it will be visible as a link
    return `https://www.google.com/search?tbm=isch&q=${query}`;
}

async function updateImages() {
    try {
        await client.connect();
        const db = client.db('test');
        const products = await db.collection('products').find({}).toArray();
        for (const product of products) {
            const imageUrl = getGoogleImageUrl(product.name);
            await db.collection('products').updateOne(
                { _id: new ObjectId(product._id) },
                { $set: { imageUrl } }
            );
            console.log(`Updated: ${product.name}`);
        }
        console.log('All product images updated to Google search URLs.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

updateImages();
