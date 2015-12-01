express = require('express')
csrf = require('csurf')
router = express.Router()

router.use(csrf())

### GET home page. ###

router.get '/:name', (req, res) ->
  name = req.params.name
  res.render 'partials/' + name, csrfToken: req.csrfToken()

module.exports = router
