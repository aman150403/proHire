import jwt from 'jsonwebtoken';

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decodedToken;
    next();

  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

export { verifyJwt };
