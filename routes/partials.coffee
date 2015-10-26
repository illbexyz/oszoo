express = require('express')
router = express.Router()

### GET home page. ###

router.get '/:name', (req, res) ->
  name = req.params.name
  res.render 'partials/' + name
  return
module.exports = router
