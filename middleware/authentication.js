const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");

module.exports.checkCookie = (req, res, next) => {
  let authcookie = req.headers.cookie

  if (!authcookie) {
    return res.status(403).send({error: 'Cookie does not exist'});
  }

  //Check if cookie contains an = and return the token
  if (authcookie.indexOf('=') >= 0 ) {
    authcookie = req.headers.cookie.split('=')[1]
  }

  //Check if cookie is stringified and return it without strings
  if (authcookie.indexOf('"') >= 0 ) {
    authcookie = req.headers.cookie.split('"')[1]
  }

  if (!jwt) {
    return res.status(403).send({error: 'Token does not exist'});
  }


  jwt.verify(authcookie, process.env.ACCES_TOKEN_SECRET, (err, data) => {
    if (err) {
      res.status(403).send({error: 'Malformed token detected'})
    } else if (data) {
      req.id = data.id
      req.role = data.role
      next()
    } else {
      res.send({message: 'something else in check jwt'})
    }
  })
}

module.exports.checkCookieForChat = (socket) => {
  // console.log("Dit is cookie: " + socket.request.headers.cookie)
  const authcookie = socket.request.headers.cookie.split("=")[1]
  if (!authcookie) {
    return res.status(403).send({error: 'Cookie does not exist'});
  }

  if (!jwt) {
    return res.status(403).send({error: 'Token does not exist'});
  }

  jwt.verify(authcookie, process.env.ACCES_TOKEN_SECRET, (err, data) => {
    if (err) {
      res.status(403).send({error: 'Malformed token detected'})
    } else if (data) {
      socket.request.id = data.id
      socket.request.role = data.role
      console.log("Role: " + socket.request.role)
      // next()
    } else {
      res.send({message: 'something else in check jwt'})
    }
  })
}

module.exports.checkPassword = (data, password, res, next) => {
  bcrypt.compare(password, data[0].password).then(result => {
    result ? createCookie(data[0].id, data[0].firstName, data[0].lastName, data[0].role, res, next) : res.status(400).send({
      error: 'Invalid credentials'
    })
  })
}

const createCookie = (id, firstName, lastName, role, res, next) => {
  const token = createToken(id, firstName, lastName, role);
  try {
    res.cookie("access_token", token, {
      //HttpOnly = true meaning we cannot access the token via the javascript aka frontend/google chrome console
      httpOnly: true,
      //Set timer on 1 hour
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    }).status(200)
      .json({message: "Logged in successfully"});
  } catch (e) {
    throw e
  }
  next();
}

const createToken = (id, firstName, lastName, role) => {
  return jwt.sign(
    {
      id: id,
      firstName: firstName,
      lastName: lastName,
      role: role
    }, process.env.ACCES_TOKEN_SECRET
  )
}
