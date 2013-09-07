function getURLParameter(name) {
  return decodeURIComponent(
      (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}
var token;
if ( getURLParameter("showFB") != 'null' && (token = getURLParameter('access_token')) != 'null' ) {
  chrome.extension.getBackgroundPage().window.sessionStorage['accessToken'] = 'access_token=' + token;
  chrome.extension.getBackgroundPage().onAccessTokenChange();
  // chrome.extension.getBackgroundPage().window.sess
  console.log("test");
  var ww = window.open(window.location, '_self'); ww.close();
}