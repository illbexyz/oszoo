var oio = require('orchestrate');
oio.ApiEndPoint = "api.aws-eu-west-1.orchestrate.io";
var orchestrate = oio('11eff33e-251f-46ae-81c1-fa0b0472789f')

orchestrate.ping().fail(function (err) {
  console.log("Database unreachable");
});

module.exports = orchestrate;