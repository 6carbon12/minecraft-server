import jwt from 'jsonwebtoken';
import {APP_PASSWORD, JWT_SECRET} from './constants.js'

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

export const login = (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    const token = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600000
    });

    res.status(200).json({ message: "Login Successful."})
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
}
