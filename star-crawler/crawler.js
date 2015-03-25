
var http = require("http");

var GITHUB_API_PATH = "https://api.github.com/"

module.export = {

    /**
     * Extract a list with all users from the api
     * users are returned by github IDs
     *
     * @return {string[]}
     */
    users: function ()
    {
        return []
    },

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