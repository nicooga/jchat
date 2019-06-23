import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { MongoClient } from 'mongodb'

import Users from './Users'

const DB_URL = 'mongodb://localhost:27017'
const DB_NAME = 'jchat_development'

MongoClient.connect(DB_URL, (_err, client) => global.db = client.db(DB_NAME))

const app = express()

app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', async function (req, res) {
  if (req.cookies.userId) {
    const user = await Users.findById(req.cookies.userId)
    res.render('index.pug', { user })
  } else {
    res.render('index.pug')
  }
})

app.post('/login', async function (req, res) {
  const { email_or_nick, password } = req.body

  const user =
    await Users.findOne({ email: email_or_nick }) ||
    await Users.findOne({ nick: email_or_nick })

  if (user.password == password) {
    res.cookie('userId', user._id)
  }

  res.redirect('/')
})

app.post('/register', async function (req, res) {
  const { email, nick, password, password_confirmation: passwordConfirmation } = req.body

  if (password !== passwordConfirmation) {
    res.render('index.pug', { flashMessage: 'Password does not match password confirmation' })

  } else if (await Users.find({ email }).count()) {
    res.render('index.pug', { flashMessage: 'User already registered with that email. Please login' })

  } else if (await Users.find({ nick }).count()) {
    res.render('index.pug', { flashMessage: 'User already registered with that nick. Please login' })

  } else {
    const user = await Users.register({ email, password, nick })
    res.cookie('userId', user._id)
    res.render('index.pug', { flashMessage: `Welcome to JChat ${user.nick}` })
  }
})

app.post('/logout', async function (req, res) {
  res.clearCookie('userId')
  res.redirect('/')
})

app.listen(3000)
console.log('App listening on port 3000')
