var Templates = {
  topContainerItem : _.template([
      "<div class='recent-search-item' data-url='<%= url %>'> ",
      " <div class='bubble-head'>",
          "<div class='tooltip' data-name='<%= name %>'><img src='https://graph.facebook.com/<%= facebookID %>/picture'></img></div>",
        "</div>",
        " <h3><%= title %></h3>",
        " <img src='<%= image %>'></img>",
      "</div>"
  ].join('\n'))
}

var Navbar = (function() {
  var $el;
  function initialize($$el, user) {
    $el = $$el;
    $topContainer = $el.find('.top-container');
    $botContainer = $el.find('.bottom-container');
    $el.on('click', '.recent-search-item', function(e) {
      window.location = $(e.target).closest('.recent-search-item').data('url')
    });
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