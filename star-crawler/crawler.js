
var GITHUB_API_HOST = "https://api.github.com";


var https = require('https');
var parse = require('parse-link-header');
var urls = require('url');

// stores the address of the next user page to fetch
var nextUsers;
var nextStars;

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
                        next: next.url
                    })
            }
        });

    }).on("error", function(e) {
        console.log("Error while GET " + e.message + "\noptions:\n" + JSON.stringify(options))
    })

};

/**
 * Extract a list with users from the api
 * users are returned by github IDs
 * will fetch the following users next time it's called
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

    var url = nextUsers || (GITHUB_API_HOST + "/users");

    apiRequest(url, function (response) {
        nextUsers = response.next;
        callback(extractUsers(response.data))
    })
};

/**
 * Returns the repos starred by a user
 * repos are returned by github IDs
 *
 *  @param {string} user
 *  @return {string[]}
 */
var stars = function(user, callback)
{
    var extractStar = function(obj)
    {
        return {
            id: obj.id
        }
    };

    var extractStars = function(objs)
    {
        return objs.map(extractStar)
    };

    var url;
    if (nextStars != undefined && nextStars.user == user)
        url = nextStars;
    else
        url = (GITHUB_API_HOST + "/users/" + user + "/starred");

    apiRequest(url, function (response) {
        nextUsers = {
            user: user,
            next: response.next
        };
        callback(extractStars(response.data))
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
    stars: stars
};