var NEW_LISTING_URL_REGEX = /.*post\.craigslist\.org.*s=redirect/,
  SHOULD_SCRAPE_REGEX = /.*craigslist\.org.*#should_scrape=yes/,
  SEARCH_RESULTS_PAGE_REGEX = /.*craigslist\.org.*query=.*/,
  ID_MATCH_REGEX = /\/[0-9]+\./;


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
          var CraigID;
          if ( NEW_LISTING_URL_REGEX.exec(window.location.toString()) ) {
            chrome.runtime.sendMessage({ event: 'NewListing', data: {
              url: encodeURI($(document.body).find("#pagecontainer section ul li a").first().text())
            }});
          } else
          if ( SEARCH_RESULTS_PAGE_REGEX.exec(window.location.toString())) {
            var $injectedResultsContainer = $("<div id='injected-results-container' style='margin-bottom:20px'></div>");
            InjectedResults.initialize($injectedResultsContainer, $("#query").val());
          } else {
            var craigIDMatch = ID_MATCH_REGEX.exec(window.location.toString())[0],
              craigID = craigIDMatch.substring(1,craigIDMatch.length-1);
            if (!craigID) { 
              return;
            }
            var Listing = Parse.Object.extend("Listing");
            var listingQuery = new Parse.Query(Listing);
            listingQuery.equalTo("craigID", craigID);
            listingQuery.find({
              success : function(result) {
                var Relation = Parse.Object.extend("Relation");
                var relationQuery = new Parse.Query(Relation);
                relationQuery.equalTo('id_1', result[0].attributes.facebookID);
                relationQuery.equalTo('id_2', user.id);
                relationQuery.find({
                  success: function(result2) {
                    if ( result2.length ) {

                      var $el = $("<div id='agora-sidebar' style='width:50%; vertical-align: top; max-width: 350px; box-sizing: border-box; display: inline-block;'></div>");
                      $("section.body").html( $( "<div id='original-content' style='margin-left: 30px;display:inline-block; box-sizing: border-box; width: 50%;'>"+$("section.body").html()+"</div>" )).addClass("clearfix").prepend($el);
                      $el.css('height', $("#original-content").height()+'px' );
                      $el.css('margin',$("#original-content").css('margin'));
                      $el.css('padding', $("#original-content").css('padding'));
                      TrustworthyView.initialize($el, user.id, result[0].attributes.facebookID, result[0]); 

                    }
                  }
                })
              },
              error: function() {
                console.log("ListingQueryError", arguments);
              }
            })
          }
        }
      }
    );
  }

})(document, window);