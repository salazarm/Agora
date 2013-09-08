var Agora = {},
  ID_MATCH_REGEX = /\/[0-9]+\./

var C_ = {
  	FACEBOOK : "https://www.facebook.com/dialog/oauth?client_id=164621370398044&response_type=token&scope=email,read_mailbox,read_stream,sms"
	},
	callback,
	pusher = new Pusher('5a98a976b95dc707dd88', { encrypted: true } ),
	ownChannel;
						

Agora.Events = {
  onPageLoad : function(data, sendResponse) {
  	console.log("start");
    if( sessionStorage.user ) {
      var user = JSON.parse(sessionStorage.user);
      if ( /*!user.friendListings */ true ) {
        var user_array = user.friends.data;
        var id_array =[];
        for(var i = 0; i < user_array.length; i++){
          id_array.push(user_array[i].id);
        }
        var Listing = Parse.Object.extend("Listing");
        var listing_query = new Parse.Query(Listing);
        listing_query.containedIn("facebookID", id_array);
        listing_query.descending("createdAt");
        listing_query.limit(5);
        listing_query.find({
          success:function(results){
            user.friendListings = results;
            sendResponse( user );
            sessionStorage.user = JSON.stringify(user);
            scrapeInfo(user);
       			sessionStorage.user = JSON.stringify(user);
          },
          error:function(error){
            console.log("ERROR", arguments);
          }
        });
      } else {
        sendResponse(user);
      }
    } else {
      sendResponse({ error: "NO_FACEBOOK" });
    }
  },
  onNewListing : function(data) {
    chrome.tabs.getSelected(null, function(tab) {
      var currentTabId = tab.id;
      chrome.tabs.create({'url': data.url+"#should_scrape=yes"});
      chrome.tabs.update(currentTabId, {selected: true});
    });
  },
  onScrape : function(data) {
    console.log("onScrape", data);
    var $html = $(data.html),
      user = JSON.parse(sessionStorage.user),
      title = $html.find(".postingtitle").text(),
      name = user.name,
      description = $html.find("#postingbody").text(),
      image = $html.find("figure div img").first().attr('src'),
      email = user.email,
      craigIDMatch = ID_MATCH_REGEX.exec(data.url)[0],
      craigID = craigIDMatch.substring(1,craigIDMatch.length-1),
      listing = new ParseListing();

    listing.set('craigID', craigID );
    listing.set('email', email);
    listing.set('facebookID', user.id);
    listing.set('title', title);
    listing.set('name', name);
    listing.set('description', description);
    listing.set('image', image);
    listing.set('url', data.url);

    (new Parse.Query('Listing')).equalTo('craigID', craigID).find({
      success: function(results) {
        if (!results.length) {     
          listing.save(null, {
            success: function(listing) {
              own.trigger('newEvent', listing);
            }, 
            error: function(listing, error) {
              console.log("ERROR ON", listing, error);
            }
          });
        }
      },
      error: function() {
        console.log("ERROR", arguments);
      }
    })
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    Agora.Events['on'+request.event] && 
      Agora.Events['on'+request.event](request.data,sendResponse);
    return true;
  }
);

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "FBConnect");
  port.onMessage.addListener(function(msg) {
    console.assert(msg == "LinkFacebook");
    chrome.tabs.getSelected(null, function(tab) {
      var currentTabId = tab.id;
      chrome.tabs.create({'url': chrome.extension.getURL('options/options.html')}, function(tab) {
        chrome.tabs.update(tab.id, {
            url : C_.FACEBOOK+'&redirect_uri=http://stubhubredirect.herokuapp.com&state='+encodeURIComponent(chrome.extension.getURL('options/options.html')+"?showFB=1")
          }
        );
        callback = function(data) {
          port.postMessage(data);
        }
        chrome.tabs.update(currentTabId, {selected: true});
      });
    });
  });
});


chrome.extension.getBackgroundPage().onAccessTokenChange = function() { 
  $.ajax({
    url: "https://graph.facebook.com/me?fields=friends,name&"+sessionStorage.accessToken,
    success: function(userInfo) {
      sessionStorage.user = JSON.stringify(userInfo);
      callback(userInfo);

    }
  });
}




