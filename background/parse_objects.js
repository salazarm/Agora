(function() { 
  Settings = {
    "AppId": "PA0KTYhAm4Mp08FLPpinKqJIkjWM2DIqSyvuoRzG",
    "ClientKey" : "gIyw97sLzUpEJeMsuzaIrqPrxrrN7wheKfCqrGAp",
    "JSKey": "gAlYjyT4ln4lGZwl9NIdReHEq0rQMD952BZ3iVS9",
    "RESTAPIKey": "pHOoq8fjpkds5iZMURPqAkm9sDeKnSzznN06VKjl",
    "MasterKey": "JJaENoedBjnw9OZNzqolsQrQrjM48PCIuHAszQys",
  }
  Parse.initialize(Settings.AppId, Settings.JSKey );
})();

var ParseListing = Parse.Object.extend("Listing");