const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");

function authenticate(req, res) {
  const { username, password } = req.body;
  if (username === "user" && password === "laco333") {
    const token = jwt.sign({ username, role: "user" }, SECRET_KEY);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 360000000 // 1 hour in milliseconds
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials", jwtkey: SECRET_KEY });
  }
}

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    decoded.exp
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({
      message: `Invalid token. Make sure that it is encrypted with the correct key.`,
    });
  }
}

module.exports = { authenticate, verifyToken };