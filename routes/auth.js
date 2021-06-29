import jwt from 'express-jwt';

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: jwt({
    secret: 'secret',
    algorithms: ['HS256'],
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: true
  }),
  optional: jwt({
    secret: 'secret',
    algorithms: ['HS256'],
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false
  })
};

export default auth;