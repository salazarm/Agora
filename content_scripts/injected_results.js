var InjectedResults = (function() {
  var template = _.template([
    "<div class='injected-result clearfix'>",
    " <div class='clearfix'>",
    "   <div class='left'>",
    "     <a class='search-listing-image-wrapper' src='<%= url %>'>",
    "       <img src='<%= image %>' width='116px' height='76px'></img>",
    "     </a>",
    "   </div>",
    "   <div class='left'>",
    "        <div class='top'>",
    "         <a href=\"<%= url %>\" style=\"background-image: url(https://graph.facebook.com/<%= facebookID %>/picture);\" class=\"user-icon left tooltip\" data-name='<%=name%>'>",
    "         </a>",
    "          <div class=\"top-info left\">",
    "            <h3><a href=\"<%= url %>\" class=\"title\"><%= title %><span class=\"new_icon\"></span></a></h3>",
    "            <div class=\"address\"><%= description %></div>",
    "          </div>",
    "        </div>",
    "        <div class=\"bottom\">",
    "        </div>",
    "   </div>",
    " </div>",
    "</div>"
  ].join('\n'));
  var $el;
  function initialize($el, searchQuery) {
    search_listing(searchQuery, function(results) {
      if ( results.length ) {
        $el.append("<div style='margin-left: 10px;margin-bottom: -10px;background-color: #eee;box-shadow: 0 1px 1px #444;width: 100px;padding: 5px;'>Your Network</div>");
        $("blockquote").first().after($el);
      }
      for(var i=0; i<results.length; i++) {
        $el.append(template(results[i].attributes));
      }
    });
  }

  return {
    initialize: initialize
  }
})();