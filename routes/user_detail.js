const express = require("express"),
  router = express.Router(),
  hdb_callout = require("../utility/harperDBCallout");

router.get("/", function(req, res) {
  if (!req.user || !req.user.active || !req.user.password) {
    return res.redirect("/login?ref=security");
  }

  if (!req.query || !req.query.un) {
    return res.redirect("/security");
  }

  const operation = {
    operation: "list_users"
  };

  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(users => {
      const detail_user = users.find(user => req.query.un === user.username);

      if (detail_user) {
        return res.render("user_detail", {
          user: req.user,
          detail_user: detail_user,
          json_detail_user: JSON.stringify(detail_user)
        });
      }
    })
    .catch(err => {
      return res.render("user_detail", {
        user: req.user,
        detail_user: {},
        error: err
      });
    });
});

module.exports = router;
