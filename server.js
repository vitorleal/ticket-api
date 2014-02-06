var express   = require('express'),
     request  = require('request'),
     app      = express();

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
};

app.configure(function () {
  app.use(allowCrossDomain);
  app.use(express.compress());
});

app.get('*', function(req, res) {
  res.send({ "error": "A Ticket SA por motivos de força maior retirou a aplicação do ar. Desculpem o transtorno!" });
});

app.listen(process.env.PORT || 3000);
