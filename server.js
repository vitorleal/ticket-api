var express  = require('express'),
     request = require('request'),
     app     = express();


//Make url function
var makeUrl = function(card) {
  var base   = "http://www.ticket.com.br/portal-web/consult-card",
      random = function() {
        return Math.random();
      };

  return base + "/balance/json?chkProduto=TR&card=" + card + "&rand=" + random;
};


//Get card balance
app.get('/card/:number', function(req, res) {
    var card = req.params.number;

    var options = {
      headers: {
        "Host"   : "www.ticket.com.br",
        "Referer": "http://www.ticket.com.br/portal/portalcorporativo/home/home.htm",
        "X-Requested-With": "XMLHttpRequest",
        "Accept" : "application/json, text/javascript, */*; q=0.01"
      },
      url: makeUrl(card)
    };

    request(options, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        var result = JSON.parse(body);

        if (err || !result.status) {
          res.send({ "error": result.messageError });

        } else {
          res.send(result.card);
        }
      } else {
        res.send({ "error": err });
      }
    });
});

app.listen(3000);
console.log('Listening on port 3000...');
