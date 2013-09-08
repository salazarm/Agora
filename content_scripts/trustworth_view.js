var TrustworthyView = (function() {

  var _within = function(val, delta, testval) {
      delta = Math.abs(delta)
      if (testval<val+delta && testval>val-delta){
          return true;
      }
      return false;
  }

  var make_rgb = function(r,g,b){
      var extra = ""
      var delta = 50
      if (_within(250, delta, r) && _within(213, delta, g) && _within(31, delta, b)){
          extra = "color:#000;";
      }
      return "rgb("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+");"+extra;
  };

  var template = _.template([
    "<div class='agora-reputation'>",
    "  <div class='top'>",
    "   <h1 class='rep' style='background-color: <%= color %>'><strong><%= trust %>%</strong><br/><span>Trust</em></span>",
    "  </div>",
    "  <div class='middle'>",
    "    <div class='profile-picture-round'>",
    "     <img src='https://graph.facebook.com/<%= facebookID %>/picture?type=large'></img>",
    "     <h2 style='font-size:1.5em; color: #fff; text-shadow: 0 1px 1px #111;'><%= name %></h2>",
    "    </div>",
    "  </div>",
    "  <div class='bottom'>",
    "   <h2 style=' text-shadow: 0 1px 1px #fff; color: #222; padding-bottom: 5px;'><%= name %>'s' Listings</h2>",
    "  </div>",
    "</div>"
  ].join('\n'));
  
  function initialize( $el, user, user2, listing ) {
    get_coefficient(user, user2, function(coef) {
      var trust = listing.attributes.trust = Math.min(100, coef);
      var r = 13*(trust/100) + 206*(1-(trust/100));     
      var g = 154*(trust/100) + 45*(1-(trust/100));
      var b = 83*(trust/100) + 40*(1-(trust/100));
      listing.attributes.color = make_rgb(r,g,b);

      var Listing = Parse.Object.extend("Listing");
      var listingQuery = new Parse.Query(Listing);
      listingQuery.equalTo('facebookID', user2);
      listingQuery.find({
        success: function(listings) {
          console.log("GOT", arguments);
          $el.html(template(listing.attributes));
          $listings = $el.find('.bottom');
          for (var i=0; i<listings.length; i++) {
            $listings.append(
              "<div class='bubble-head'>"+
              "   <a href='"+listings[i].attributes.url+"''><img src="+listings[i].attributes.image+"></img>"+
              "</a></div>"
            );
          }
          if ( listings.length == 0) {
            $listings.html("<h1>No Past Listings found</h1>");
          }
        }
      })
    })
  }

  return {
    initialize: initialize
  }
})();