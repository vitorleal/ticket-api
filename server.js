var express   = require('express'),
     request  = require('request'),
     newrelic = require('newrelic'),
     app      = express();

var def = {
  headers: {
    "Host"            : "www.ticket.com.br",
    "Referer"         : "http://www.ticket.com.br/portal/portalcorporativo/home/home.htm",
    "X-Requested-With": "XMLHttpRequest",
    "Accept"          : "application/json, text/javascript, */*; q=0.01"
  }
}

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
};

app.configure(function () {
  app.use(allowCrossDomain);
  app.use(express.compress());
});

//Make url function
var makeUrl = function(card, token, rows) {
  var base   = "http://www.ticket.com.br/portal-web/consult-card",
      random = function() {
        return Math.random();
      },
      rows = (rows) ? rows : 20;

  if (!token) {
    return base + "/balance/json?chkProduto=TR&card=" + card + "&rand=" + random();

  } else {
    return base + "/release/json?txtOperacao=lancamentos&token=" + token + "&card=" + card + "&rows=" + rows + "&rand=" + random();
  }
};

//Get card balance
app.get('/card/:number', function(req, res) {
    var card = req.params.number,
        options = {
          headers: def.headers,
          url: makeUrl(card)
        };

    request(options, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        var result;
        try {
          result = JSON.parse(body);

        } catch(e) {
          result = body;
        }

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

app.get('/list/:number', function(req, res) {
    var card = req.params.number,
        options = {
          headers: def.headers,
          url    : makeUrl(card)
        };

    request(options, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        var result;

        try {
          result = JSON.parse(body);

          var opt = {
            headers: def.headers,
            url    : makeUrl(card, result.token)
          };

          request(opt, function (error, resp, content) {
            var json;

            if (!error && resp.statusCode === 200) {
              try {
                json = JSON.parse(content);

              } catch(e) {
                json = content;
              }

              if (err || !json.status) {
                res.send({ "error": json.messageError });

              } else {
                res.send({
                  "balance"   : json.card.balance,
                  "list"      : json.card.release,
                  "scheduling": json.card.scheduling
                });
              }


            } else {
              res.send({ "error": error });
            }

          });

        } catch(e) {
          result = body;
        }
      } else {
        res.send({ "error": err });
      }
    });
});

app.get('*', function(req, res) {
  res.send({ "error": "404", "suggestion": "You should use /card/0000000000000000"});
});

app.listen(process.env.PORT || 3000);
