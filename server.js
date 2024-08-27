const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const url = require("url");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your-secret-key"; // Change this to a strong and secure secret key

app.use(bodyParser.json());

app.get("/ping", (req, res) => {
  res.json("pong");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/home", (req, res) => {
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
    <button id="creditCardButton">Ma carte de crédit</button>

    <script>
    
        const dropTableButton = document.getElementById('dropTableButton');
        const creditCardButton = document.getElementById('creditCardButton');
        
        // Function to make a GET request and display the response in an alert
        const makeGetRequest = async (url) => {
          try {
            const response = await fetch(url, { headers: new Headers({
                                    // Retrieve the token from local storage
                  'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
              }) });
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

        creditCardButton.addEventListener('click', () => {
            makeGetRequest('/creditCards');
        });
    </script>
</body>
</html>
`;
  res.send(htmlResponse);
});

// Create a POST route to generate and return JWT token
app.post("/authenticate", (req, res) => {
  const { username, password } = req.body;
  // In a real application, you would typically validate the username and password against a database
  if (username === "user" && password === "laco333") {
    // Create a JWT token
    const token = jwt.sign({ username, role: "user" }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/creditCards", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json("4550-1231-4584-8844");
  } catch (e) {
    res
      .status(401)
      .json({
        message: `Invalid token. Make sure that it is encrypted with the key : ${SECRET_KEY}`,
      });
  }
});

app.get("/transferAcount", (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { query } = parsedUrl;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (query.name) {
      // Logique du code pour faire le transfert de compte
      res.status(200).json(
        `Le tranfert de de votre carte est réussie! :${query.name} possède maintenant votre carte.`
      );
    }
    else {
      res.status(200).json(
        "il manque le parameter name pour effectuer le tranfert de carte de crédit"
      );

    }
  } catch (e) {
    res.status(401).send(e);
  }
});

app.get("/dropTables", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role === "administrator") {
      res.json("All tables were dropped, we are doomed! :(");
    } else {
      res
        .status(401)
        .send("cannot drop table. Only use once when initiating the server");
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
