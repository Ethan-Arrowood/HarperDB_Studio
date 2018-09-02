"use strict";

const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  path = require("path"),
  favicon = require("express-favicon"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  session = require("express-session"),
  hdb_callout = require("./utility/harperDBCallout"),
  http = require("http"),
  https = require("https"),
  winston = require("winston"),
  log_utils = require("./utility/logUtils"),
  fs = require("fs");

const compare_version = require("version-comparison");

const config = require("./config/config.json");
const DEFAULT_HTTP_PORT = 61183;
const MINIMUM_NODE_VERSION = "8.11.0";

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.static(path.join(__dirname, "resources")));
app.set("views", path.join(__dirname + "/pages"));
app.set("view engine", "jade");
app.use(
  favicon(
    "https://s3.amazonaws.com/hdb-marketing/harperdb__flavicon_4Cw_icon.ico"
  )
);
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge: 60000 * 15 // 15 minutes
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// route
let main = require("./routes/main"),
  login = require("./routes/login"),
  security = require("./routes/security"),
  explore = require("./routes/explore"),
  logs = require("./routes/logs"),
  logout = require("./routes/logout"),
  user_detail = require("./routes/user_detail"),
  schema = require("./routes/schema"),
  health = require("./routes/health"),
  help = require("./routes/help"),
  live_link = require("./routes/live_link");

app.use("/main", main);
app.use("/login", login);
app.use("/security", security);
app.use("/explore", explore);
app.use("/logs", logs);
app.use("/logout", logout);
app.use("/user_detail", user_detail);
app.use("/schema", schema);
app.use("/health", health);
app.use("/help", help);
app.use("/livelink", live_link);
app.use("/", main);

//authen
passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true
    },
    function(req, username, password, done) {
      const call_object = {
        username: username,
        password: password,
        endpoint_url: req.body.endpoint_url,
        endpoint_port: req.body.endpoint_port
      };

      const operation = {
        operation: "user_info"
      };

      hdb_callout
        .callHarperDB(call_object, operation)
        .then(response => {
          let user = {
            endpoint_url: req.body.endpoint_url,
            endpoint_port: req.body.endpoint_port
          };

          if (response.error && response.statusCode === 403) {
            user = { ...user, username, password, super_user: false };
          } else if (response.active) {
            user = { ...user, ...response, password, super_user: true };
          } else {
            throw new Error("Invalid credentials");
          }

          return done(null, user);
        })
        .catch(err => done(null, false, { message: err.message }));
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

runServer();

async function runServer() {
  try {
    await log_utils.initLogger();
  } catch (e) {
    console.error(
      `got an error initializing logger ${e}, check your logger settings in config and restart the studio.`
    );
  }

  if (compare_version(process.version, MINIMUM_NODE_VERSION) < 0) {
    console.log(
      `HarperDB Studio requires Node.js version ${MINIMUM_NODE_VERSION} or higher`
    );
    return;
  }

  let http_port = config.http_port;
  if (!http_port && !config.https_port) {
    http_port = DEFAULT_HTTP_PORT;
  }

  if (http_port) {
    http.createServer(app).listen(http_port, () => {
      console.log("HarperDB Studio running on port " + http_port);
    });
  }

  if (config.https_port && config.https_key_path && config.https_cert_path) {
    let credentials = {
      key: fs.readFileSync(config.https_key_path),
      cert: fs.readFileSync(config.https_cert_path)
    };

    https.createServer(credentials, app).listen(config.https_port, function() {
      console.log("HarperDB Studio running on port " + config.https_port);
    });
  }
}
