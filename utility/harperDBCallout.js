const { HarperDBConnect } = require('harperdb-connect');

function callHarperDB(call_object, operation, callback){
    const db = new HarperDBConnect();
    
    db.setAuthorization(call_object.username, call_object.password)

    const regex = /^(https?:\/\/)/gm;
    const {endpoint_url, endpoint_port} = call_object;
    const url = regex.test(endpoint_url) ? (
        `${endpoint_url}:${endpoint_port}`
    ) : (
        `http://${endpoint_url}:${endpoint_port}`
    )

    db.connect(url)
        .then(() => console.log('Connected!'))
        .catch(err => callback(`Failed to connect to ${url}`, null))

    db.setDefaultOptions({
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        },
        json: true
    });
    db.request(operation, true)
        .then(res => callback(null, res))
        .catch(err => callback(err, null))
}

module.exports = {
    callHarperDB: callHarperDB
}