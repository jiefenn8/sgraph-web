//Get graph result from search query
function getResultsFromSearch(keywords, callback) {
  if (keywords !== undefined) {
    console.log(`Attempting to retrieve: ${keywords}`);
    var url = "http://localhost:3000/search?q=" + keywords;
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        callback(data);
      } else {
        console.log(request.responseText);
      }
    };
    request.send();
  } else {
    console.log("Search failed attempting to send undefined key.");
  }
}

function search() {
  var keywords = document.getElementById("searchText").value;
  keywords = encodeURIComponent(keywords.trim()).replace(/%20/g, "+");
  getResultsFromSearch(keywords, renderGraphV3);
}
