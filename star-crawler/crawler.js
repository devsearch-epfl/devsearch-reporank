
var GITHUB_API_HOST = "https://api.github.com";


var https = require('https');
var parse = require('parse-link-header');
var urls = require('url');

/**
 * Returns the json from an API call with suffix
 * callback function is called with a response object containing
 *      url {string}, data {obj[]}, next {strin} the url of the next page
 *
 * @param {string} suffix
 * @param {function} callback
 */
var apiRequest = function (url, callback)
{
    var parsedUrl = urls.parse(url);

    var options = {
        host: parsedUrl.host,
        path: parsedUrl.path,
        headers: {'user-agent': 'node.js'/*'Mozilla/5.0'*/}
    };

    https.get(options, function (response) {

        var buffer = "";
        var headers = response.headers;

        //console.log(headers)
        var next = headers['link'] == undefined ? undefined : parse(headers['link'])['next'];

        response.on("data", function (data) {
            buffer += data;
        });

        response.on("end", function (err) {

            // in case of an error
            if (response.statusCode !== 200)
            {
                console.log("HTTP ERROR " + response.statusCode + " for options " + JSON.stringify(options))
                console.log("msg: " + JSON.stringify(JSON.parse(buffer)));

                callback(
                    {
                        url: url,
                        data: []
                    });
            }
            else
            {
                var parsed = JSON.parse(buffer);

                callback(
                    {
                        url: url,
                        data: parsed,
                        next: next
                    })
            }
        });

    }).on("error", function(e) {
        console.log("Error while GET " + e.message + "\noptions:\n" + JSON.stringify(options))
    })

};

/**
 * Extract a list with all users from the api
 * users are returned by github IDs
 *
 * @param  {function} callback
 */
var users = function(callback)
{
    var extractUser = function(obj)
    {
        return {
            id: obj.id,
            login: obj.login
        }
    };

    var extractUsers = function(objs)
    {
        return objs.map(extractUser)
    };

    apiRequest(GITHUB_API_HOST + "/users", function (response) {
        console.log(response)
        callback(extractUsers(response.data))
    })
};

module.exports = {

    /**
     * Extract a list with all users from the api
     * users are returned by github IDs
     *
     * @param  {function} callback
     */
    users: users,

    /**
     * Returns the repos starred by a user
     * repos are returned by github IDs
     *
     *  @param {string} user
     *  @return {string[]}
     */
    stars: function (user)
    {
        return []
    },

    /**
     * Returns a list of users and the repos they star
     * return object is a mat from userID to list of repoIDs
     *
     * @return {object}
     */
    globalStars: function ()
    {
        return {}
    }

};