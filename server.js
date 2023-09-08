const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your-secret-key'; // Change this to a strong and secure secret key

app.use(bodyParser.json());

app.get('/ping', (req, res) => {
  res.json('pong')
})
// Create a POST route to generate and return JWT token
app.post('/authenticate', (req, res) => {
    console.log(req)
    console.log(req.headers)
    console.log(req.body)
  const { username, password } = req.body;

  // In a real application, you would typically validate the username and password against a database
  if (username === 'admin' && password === 'admin') {
    // Create a JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
