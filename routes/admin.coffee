express = require('express')
router = express.Router()

### GET home page. ###

router.get '/', (req, res, next) ->
  res.render 'admin', title: 'Admin'
  return
module.exports = router
