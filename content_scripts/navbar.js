var Templates = {
  topContainerItem : _.template([
    "<a href='<%=url%>'><div class='recent-search-item'>",
    " <div class='bubble-head><img src='https://graph.facebook.com/<%= facebookID %>/picture'></img>",
    " <h3><%= title %></h3>",
    " <img src='<%= image %>'></img>",
    " <p><%= description %></p>",
    " <a> Contact <%= name %>!</a>",
    "</div></a>"
  ].join('\n'))
}

var Navbar = (function() {
  var $el;
  function initialize($$el, user) {
    $el = $$el;
    $topContainer = $el.find('.top-container');
    $botContainer = $el.find('.bottom-container');
    for (var i=0; i<user.friendListings.length; i++) {
      $topContainer.append( Templates.topContainerItem(user.friendListings[i]) );     
    }
    $(document).click(function(e) {
      $topContainer.slideUp();
    })
    $el.find("input").click(function(e) {
      e.stopPropagation();
      $topContainer.slideDown();
    })
    $el.click(function(e){
      e.stopPropagation();
    });
  }

  return {
    initialize: initialize
  }
})();