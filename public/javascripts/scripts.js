/*
* Author: Project #2
* Project Name: Project #2 Custom JS
* Version: 1
* Date: 10/29/17
* URL:  github.com/itsokayitsofficial/project2
*/
$(function() { 
  var authCode = getAuthCode(window.location.href);

  function getAuthCode(url){
    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
        throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  }

});
