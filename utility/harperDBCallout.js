const http = require('http');


function callHarperDB(call_object,operation,  callback){


    var options = {
        "method": "POST",
        "hostname": call_object.endpoint_url,
        "port": call_object.endpoint_port,
        "path": "/",
        "headers": {
            "content-type": "application/json",
            "authorization": "Basic " + new Buffer(call_object.username + ':' + call_object.password).toString('base64'),
            "cache-control": "no-cache"
        }
    };


    var http_req = http.request(options, function (hdb_res) {
        var chunks = [];


        hdb_res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        hdb_res.on("end", function () {
            var body = Buffer.concat(chunks);
            if (isJson(body)) {
               return callback(null, JSON.parse(body));
            } else {
               return callback(body, null);

            }

        });


    });


    http_req.on("error", function (chunk) {
        return callback("Failed to connect", null);
    });


    http_req.write(JSON.stringify(operation));
    http_req.end();

}


function isJson(s) {
    try {
        JSON.parse(s);
        return true;
    } catch (e) {
        return false;
    }
};

module.exports ={

    callHarperDB: callHarperDB
}