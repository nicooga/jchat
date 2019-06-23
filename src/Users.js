import { ObjectID } from 'mongodb'

const findOne = filters => 
  new Promise((resolve, reject) => {
    global.db.collection('users').findOne(filters, (err, user) =>
      err ? reject(err) : resolve(user)
    )
  })

const findById = id => global.db.collection('users').findOne(new ObjectID(id))
const find = props => global.db.collection('users').find(props)
const register = user =>
  new Promise((resolve, reject) => {
    global.db.collection('users').insert(user, (err, result) => {
      if (err) reject()
      else {
        const { ops: [user] } = result
        resolve(user)
      }
    })
  })

export default { findOne, findById, find, register }
