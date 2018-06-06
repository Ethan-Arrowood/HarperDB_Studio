"use strict";

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    favicon = require('express-favicon'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session = require('express-session'),
    hdb_callout = require('./utility/harperDBCallout'),
    HarperDBConnect = require('harperdb-connect'),
    http = require('http'),
    https = require('https'),
    fs = require('fs');

const config = require('./config/config.json');
const DEFAULT_HTTP_PORT = 61183;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'resources')));
app.set('views', path.join(__dirname + '/pages'));
app.set('view engine', 'jade')
app.use(favicon("https://s3.amazonaws.com/hdb-marketing/harperdb__flavicon_4Cw_icon.ico"));
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 60000 * 15, // 15 minutes 
    }

}));
app.use(passport.initialize());
app.use(passport.session());

// route
var main = require('./routes/main'),
    login = require('./routes/login'),
    security = require('./routes/security'),
    explore = require('./routes/explore'),
    logs = require('./routes/logs'),
    logout = require('./routes/logout'),
    user_detail = require('./routes/user_detail'),
    schema = require('./routes/schema'),
    health = require('./routes/health'),
    help = require('./routes/help'),
    live_link = require('./routes/live_link');

app.use('/main', main);
app.use('/login', login);
app.use('/security', security);
app.use('/explore', explore);
app.use('/logs', logs);
app.use('/logout', logout);
app.use('/user_detail', user_detail);
app.use('/schema', schema);
app.use('/health', health);
app.use('/help', help);
app.use('/livelink', live_link);
app.use('/', main);

//authen
passport.use(new LocalStrategy({
    passReqToCallback: true
},
    function (req, username, password, done) {
        var db = new HarperDBConnect(username, password);

        db.connect(req.body.endpoint_url + ':' + req.body.endpoint_port).then(
            () => {
                db.request({
                    method: 'POST',
                    url: db.options.url,
                    headers: {
                        'content-type': 'application/json',
                        authorization: db.authorization,
                        'cache-control': 'no-cache'
                    },
                    body: {
                        operation: 'user_info'
                    },
                    json: true,
                }).then(user => {
                    
                    if (user && user.active) {
                        user.password = password;
                        user.endpoint_url = req.body.endpoint_url;
                        user.endpoint_port = req.body.endpoint_port;
                        return done(null, user);
                    } else if (user) {
                        return done(null, false, {
                            message: JSON.stringify(user)
                        });
                    } else {
                        return done(null, false, {
                            message: 'Invalid credentials'
                        });
                    }
                }).catch(err => {
                    return done(null, false, {
                        message: err
                    });
                })
            }
        )
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

runServer();

function runServer() {
    if (process.version >= 'v8.11.0') {
        let http_port = config.http_port;
        if (!http_port && !config.https_port) {
            http_port = DEFAULT_HTTP_PORT;
        }

        if (http_port) {
            http.createServer(app).listen(http_port, () => {                
                console.log('HarperDB Studio running on port ' + http_port);
            });
        }

        if (config.https_port && config.https_key_path && config.https_cert_path) {
            let credentials = {
                key: fs.readFileSync(config.https_key_path),
                cert: fs.readFileSync(config.https_cert_path)
            };

            https.createServer(credentials, app)
                .listen(config.https_port, function () {
                    console.log('HarperDB Studio running on port ' + config.https_port);
                });
        }
    }
    else
        console.log(" HarperDB Studio requires Node.js version 8.11 or higher");
}


