// --- IMPORTS & APP INIT ---
const path = require('path');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// --- CUSTOMER LOGIN ENDPOINT (with password check) ---
app.post('/api/customers/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.error('[CUSTOMER LOGIN] Missing email or password:', { email, password });
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    if (!customersCollection) {
      console.error('[CUSTOMER LOGIN] customersCollection is not initialized.');
      return res.status(500).json({ message: 'Customer DB not ready.' });
    }
    const customer = await customersCollection.findOne({ email });
    console.log('[CUSTOMER LOGIN] Login attempt for email:', email);
    if (!customer) {
      console.warn('[CUSTOMER LOGIN] No customer found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!customer.password) {
      console.error('[CUSTOMER LOGIN] Customer record missing password field:', customer);
      return res.status(500).json({ message: 'Customer record invalid.' });
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    console.log('[CUSTOMER LOGIN] Password match result:', isMatch);
    if (!isMatch) {
      console.warn('[CUSTOMER LOGIN] Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Remove password field before sending
    const { password: _, ...customerDetails } = customer;
    res.json({ message: 'Login successful.', user: customerDetails });
  } catch (err) {
    console.error('[CUSTOMER LOGIN] Unexpected error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});


const uri = "mongodb+srv://test:test123@test.kau1dag.mongodb.net/?retryWrites=true&w=majority&appName=test";
const client = new MongoClient(uri, {
  tls: true,
  serverApi: {
    version: ServerApiVersion.v1
  }
});

let usersCollection;
let db;
let customersCollection;
client.connect()
  .then(() => {
    console.log("Connected to MongoDB");
    db = client.db('test'); // Use your DB name
    usersCollection = db.collection('users');
    customersCollection = db.collection('customers');
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// --- ROUTES ---
// Health check endpoint
app.get('/ping', (req, res) => res.send('pong'));

// Register endpoint
app.post('/register', async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  if (!name || !email || !phone || !address || !password) return res.status(400).json({ message: 'All fields required.' });
  try {
    // Check if user exists
    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save to users collection
    await usersCollection.insertOne({ name, email, phone, address, password: hashedPassword });
    // Also save to customers collection for admin panel
    if (db) {
      await db.collection('customers').updateOne(
        { email },
        { $set: { name, email, phone, address } },
        { upsert: true }
      );
    }
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login endpoint (logs login event)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.error('[LOGIN] Missing email or password:', { email, password });
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    if (!usersCollection) {
      console.error('[LOGIN] usersCollection is not initialized.');
      return res.status(500).json({ message: 'Server DB not ready.' });
    }
    const user = await usersCollection.findOne({ email });
    console.log('[LOGIN] Login attempt for email:', email);
    console.log('[LOGIN] User found:', user);
    if (!user) {
      console.warn('[LOGIN] No user found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!user.password) {
      console.error('[LOGIN] User record missing password field:', user);
      return res.status(500).json({ message: 'User record invalid.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match result:', isMatch);
    if (!isMatch) {
      console.warn('[LOGIN] Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Log login event
    await usersCollection.updateOne(
      { email },
      { $push: { logins: { time: new Date(), ip: req.ip } } }
    );
    // Remove password field from user object before sending
    const { password: _, ...userDetails } = user;
    res.json({ message: 'Login successful.', user: userDetails });
  } catch (err) {
    console.error('[LOGIN] Unexpected error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- ORDER MANAGEMENT API ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ _id: result.insertedId, ...order });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const update = req.body;
    await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.json({ message: 'Order updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.collection('orders').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Order deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- CUSTOMER MANAGEMENT API ---
app.get('/api/customers', async (req, res) => {
  try {
    if (!customersCollection) {
      console.error('[CUSTOMERS] customersCollection is not initialized.');
      return res.status(500).json({ message: 'Customer DB not ready.' });
    }
    const customers = await customersCollection.find().toArray();
    res.json(customers);
  } catch (err) {
    console.error('Error in GET /api/customers:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    if (!customersCollection) {
      console.error('[CUSTOMERS] customersCollection is not initialized.');
      return res.status(500).json({ message: 'Customer DB not ready.' });
    }
    const customer = await customersCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json(customer);
  } catch (err) {
    console.error('Error in GET /api/customers/:id:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    if (!customersCollection) {
      console.error('[CUSTOMERS] customersCollection is not initialized.');
      return res.status(500).json({ message: 'Customer DB not ready.' });
    }
    const customer = req.body;
    const result = await customersCollection.insertOne(customer);
    res.status(201).json({ _id: result.insertedId, ...customer });
  } catch (err) {
    console.error('Error in POST /api/customers:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    if (!customersCollection) {
      console.error('[CUSTOMERS] customersCollection is not initialized.');
      return res.status(500).json({ message: 'Customer DB not ready.' });
    }
    const update = req.body;
    await customersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.json({ message: 'Customer updated.' });
  } catch (err) {
    console.error('Error in PUT /api/customers/:id:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    if (!customersCollection) {
      console.error('[CUSTOMERS] customersCollection is not initialized.');
      return res.status(500).json({ message: 'Customer DB not ready.' });
    }
    await customersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Customer deleted.' });
  } catch (err) {
    console.error('Error in DELETE /api/customers/:id:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- ANALYTICS API ---
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const [productCount, orderCount, customerCount] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('customers').countDocuments()
    ]);
    res.json({ productCount, orderCount, customerCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- PRODUCT MANAGEMENT API FOR ADMIN ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('POST /api/products called');
    console.log('Request body:', req.body);
    let { name, price, stock, imageUrl, status } = req.body;
    // Ensure price and stock are numbers
    price = typeof price === 'string' ? parseFloat(price) : price;
    stock = typeof stock === 'string' ? parseInt(stock) : stock;
    if (isNaN(price)) price = 0;
    if (isNaN(stock)) stock = 0;
    const result = await db.collection('products').insertOne({ name, price, stock, imageUrl, status });
    console.log('Insert result:', result);
    res.status(201).json({ _id: result.insertedId, name, price, stock, imageUrl, status });
  } catch (err) {
    console.error('Error in POST /api/products:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('PUT /api/products/' + req.params.id + ' called');
    console.log('Request body:', req.body);
    const { name, price, stock, imageUrl, status } = req.body;
    const updateResult = await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, price, stock, imageUrl, status } }
    );
    console.log('Update result:', updateResult);
    res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error('Error in PUT /api/products/:id:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.collection('products').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.patch('/api/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } }
    );
    res.json({ message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- CUSTOMER REGISTER ENDPOINT (with password) ---
// ...existing code...

// --- CUSTOMER LOGIN ENDPOINT (with password check) ---
// ...existing code...

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


