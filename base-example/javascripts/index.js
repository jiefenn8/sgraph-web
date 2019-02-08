//Get some graph to display at start
function getDefaultJSON(cb) {
  $.getJSON("http://localhost:3000/graph", function(data) {
    cb(data);
  });
}

//Get graph result from search query
function getGraphBySearch(key, cb) {
  if (key !== undefined) {
    var url = "http://localhost:3000/search/" + key;
    console.log(`Attempting to retrieve: ${key}`);
    $.getJSON(url, function(data) {
      cb(data);
    });
  } else {
    console.log("Search failed attempting to send undefined key.");
  }
}

function search() {
  var searchValue = $("#searchText").val();
  getGraphBySearch(searchValue, renderGraphV3);
}
