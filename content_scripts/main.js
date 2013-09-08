var NEW_LISTING_URL_REGEX = /.*post\.craigslist\.org.*s=redirect/;
var SHOULD_SCRAPE_REGEX = /.*craigslist\.org.*#should_scrape=yes/;
var SEARCH_RESULTS_PAGE_REGEX = /.*craigslist\.org.*query=.*/;

(function(document, window) {
  if (document.readyState == "complete") {
    init();
  } else {
    window.addEventListener("load", function() {
      setTimeout(function() {
        init();
      }, 0);

    });
  } 

  function init() {
    if (SHOULD_SCRAPE_REGEX.exec(window.location.toString())) {
      chrome.runtime.sendMessage({ event: 'Scrape', data: {html: document.body.outerHTML, url: location.protocol+'//'+location.host+location.pathname} })
      var ww = window.open(window.location, '_self'); ww.close();
      return;
    } 
    $(document.body).prepend('<div id="craigslist-social-navbar"></div><div style="height:77px;"></div>')
    chrome.runtime.sendMessage({ event: 'PageLoad'},
      function(user) {
        console.log(user);
        if (user.error) {
          if (user.error == "NO_FACEBOOK") {
            $("#craigslist-social-navbar").addClass("error").html(
              "<div style='margin: 14px auto;'><a class='fb-btn'>Link your Facebook account to use Agora</a></div>"
            );
            $(".fb-btn").click(function() {
              var port = chrome.runtime.connect({name: "FBConnect"});
              port.postMessage("LinkFacebook");
              port.onMessage.addListener(function(msg) {
                window.location.reload();
              })
            });
          }
        } else {
          var $el = $("#craigslist-social-navbar").append(
            "<div class='top-container clearfix' style='padding:10px; height: 160px; display: none;'>"+
            "</div>"+
            "<div class='bottom-container' style='padding:10px'>"+
              "<input placeholder='Search among your friends...'></input>"+
              "<div class='toggle-network-mode'></div>"+
              "<img class='profile-image' src='https://graph.facebook.com/"+user.id+"/picture'></img>"+
            "</div>"
          );
          Navbar.initialize($el, user);
          if ( NEW_LISTING_URL_REGEX.exec(window.location.toString()) ) {
            chrome.runtime.sendMessage({ event: 'NewListing', data: {
              url: encodeURI($(document.body).find("#pagecontainer section ul li a").first().text())
            }});
          }
          if ( SEARCH_RESULTS_PAGE_REGEX.exec(window.location.toString())) {
            var $injectedResultsContainer = $("<div id='injected-results-container' style='margin-bottom:20px'></div>");
            InjectedResults.initialize($injectedResultsContainer, $("#query").val());
          }
        }
      }
    );
  }

})(document, window);