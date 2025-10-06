const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const { expressjwt: exjwt } = require('express-jwt');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';
const jwtMW = exjwt({ secret: secretKey, algorithms: ['HS256'] });

let users = [
    {
        id: 1,
        email: "varun",
        password: 'varun123'
    },
    {
        id: 2,
        email: 'admin',
        password: 'admin123'
    }
]


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  for (let user of users) {
    if (user.email === email && user.password === password) {
        let token = jwt.sign({ id: user.id, username: user.email }, secretKey, { expiresIn: '3m' });
      return res.json({ success: true, error: null, message: 'Login successful', token });
    }
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
  res.json({ message: 'Welcome to the dashboard!' });
});

app.get('/api/prices'   , jwtMW, (req, res) => {
  const prices = [
    { item: 'Apple', price: 1.0 },
    { item: 'Banana', price: 0.5 },
    { item: 'Cherry', price: 2.0 }
  ];
  res.json(prices);
});

app.get('/api/settings', jwtMW, (req, res) => {
  const settings = {
    theme: 'dark',
    notifications: true,
    itemsPerPage: 10
  };
  res.json({ success: true, settings });
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, message: 'Invalid token' });
    } else {
        next(err);
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 