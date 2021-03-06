var linkedByIndex = {};

//Global configurations
var r = 6;
var widthRatio = 16;
var heightRatio = 9;
var transitionSpeed = 500;
var nodeAttractionForce = -500;
var linkdistance = 80;
var linkStrength = 2;

//Requires on existing element #graph and dependent on its size.
function renderGraphV3(graph) {
  //Backward support for d3 v3 api
  var obj = {};
  graph.nodes.forEach(function(d, i) {
    obj[d.id] = i; // create an object to look up a node's index by id
  });

  graph.links.forEach(function(d) {
    d.source = obj[d.source]; // look up the index of source
    d.target = obj[d.target]; // look up the index of target
  });

  d3.select("svg").remove();

  var element = document.getElementById("graph");
  var rect = element.getBoundingClientRect();
  var width = rect.width;
  var height = (rect.width / widthRatio) * heightRatio;

  var svg = d3
    .select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 900 507")
    .classed("svg-content-responsive", true)
    .append("g");
  /*.call(
      d3.behavior.zoom().on("zoom", function() {
        svg.attr(
          "transform",
          "translate(" +
            d3.event.translate +
            ")" +
            " scale(" +
            d3.event.scale +
            ")"
        );
      })
    )
    .append("g");*/

  //Render size - based on width and height ratio

  var color = d3.scale.category20();

  var force = d3.layout
    .force()
    .charge(nodeAttractionForce)
    .linkDistance(linkdistance)
    .linkStrength(linkStrength)
    .size([width, height]);

  d3.select("svg").on("mousedown.zoom", null);

  force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

  var link = svg
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("g")
    .attr("class", "link")
    .append("line")
    .attr("class", "link-line")
    .style("stroke-width", function(d) {
      return Math.sqrt(d.value);
    });

  var linkText = svg
    .selectAll(".link")
    .append("text")
    .attr("class", "link-label")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("fill", "Black")
    .style("font", "normal 10px Arial")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.rel;
    });

  var node = svg
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("fill", function(d) {
      return color(d.group);
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

  var text = svg
    .append("svg:g")
    .selectAll("g")
    .data(force.nodes())
    .enter()
    .append("svg:g");

  //Text shadow overlay for legibility
  text
    .append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) {
      return d.value;
    });

  text
    .append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) {
      return d.id;
    });

  svg
    .style("opacity", 1e-6)
    .transition()
    .duration(transitionSpeed * 2)
    .style("opacity", 1);

  node.on("click", function(d) {
    d.fixed = true;
  });

  node.on("dblclick", function(d) {
    d.fixed = false;
  });

  node.append("title").text(function(d) {
    return d.id;
  });

  force.on("tick", function(e) {
    var k = 6 * e.alpha;

    graph.nodes.forEach(function(o, i) {
      o.y += i & 1 ? k : -k;
      o.x += i & 2 ? k : -k;
    });

    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    linkText
      .attr("x", function(d) {
        return (d.source.x + d.target.x) / 2;
      })
      .attr("y", function(d) {
        return (d.source.y + d.target.y) / 2;
      });

    node
      .attr("cx", function(d) {
        return (d.x = Math.max(r, Math.min(width - r, d.x)));
      })
      .attr("cy", function(d) {
        return (d.y = Math.max(r, Math.min(height - r, d.y)));
      });
  });

  graph.links.forEach(function(d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
    linkedByIndex[d.target.index + "," + d.source.index] = 1;
  });
}

function neighboring(a, b) {
  return a.index == b.index || linkedByIndex[a.index + "," + b.index];
}

function mouseover(d) {
  //Enlarge selected and neigbouring nodes
  d3.selectAll(".node")
    .transition()
    .duration(transitionSpeed)
    .attr("r", function(o) {
      return o === d ? r * 1.5 : r;
    })
    .style("stroke", "black");

  //cloak non-neighbour nodes' links of selected
  d3.selectAll(".link")
    .transition()
    .duration(transitionSpeed)
    .style("opacity", function(o) {
      return o.source === d || o.target === d ? 1 : 0.1;
    });

  //cloak non-neightbour nodes of selected
  d3.selectAll(".node")
    .transition()
    .duration(transitionSpeed)
    .style("opacity", function(o) {
      return neighboring(d, o) ? 1 : 0.1;
    });
}

function mouseout() {
  //Restore default of selected and neighbouring nodes
  d3.selectAll(".node")
    .transition()
    .duration(transitionSpeed)
    .attr("r", r)
    .style("stroke", "white");
  d3.selectAll(".link")
    .style("stroke", "grey")
    .style("stroke-width", 1);
  //Uncloak
  d3.selectAll(".link")
    .transition()
    .duration(transitionSpeed)
    .style("opacity", 1);
  d3.selectAll(".node")
    .transition()
    .duration(transitionSpeed)
    .style("opacity", 1);
}
