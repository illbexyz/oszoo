oio = require('orchestrate')
bcrypt = require('bcrypt')
oio.ApiEndPoint = 'api.aws-eu-west-1.orchestrate.io'
orchestrate = oio('11eff33e-251f-46ae-81c1-fa0b0472789f')

bcrypt.genSalt 10, (err, salt) ->
  bcrypt.hash process.argv[2], salt, (err, hash) ->
    orchestrate.post 'users', {
      "username": "alberto",
      "password": hash
    }
    .then (result) ->
      console.log "ok"
