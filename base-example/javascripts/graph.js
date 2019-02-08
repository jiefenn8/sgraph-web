var linkedByIndex = {};

//Requires on existing element #graph and dependent on its size.
function renderGraphV3(graph) {
  d3.select("svg").remove();
  var svg = d3
    .select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 400")
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

  var element = document.getElementById("graph");
  var rect = element.getBoundingClientRect();
  var width = rect.width;
  var height = (rect.width / 16) * 9;

  //Render size - 16:9
  var w = width,
    h = height,
    r = 6;

  var color = d3.scale.category20(); //d3.scaleOrdinal(d3.schemeCategory20);

  var force = d3.layout
    .force()
    .charge(-500)
    .linkDistance(60)
    .linkStrength(2)
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
    .style("font", "normal 5px Arial")
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

  var linkPath = link
    .append("svg:path")
    .attr("class", function(d) {
      return "link " + d.value;
    })
    .attr("marker-end", function(d) {
      return "url(#" + d.value + ")";
    });

  var textPath = link
    .append("svg:path")
    .attr("id", function(d) {
      return d.source.index + "_" + d.target.index;
    })
    .attr("class", "textpath");

  var text = svg
    .append("svg:g")
    .selectAll("g")
    .data(force.nodes())
    .enter()
    .append("svg:g");

  // A copy of the text with a thick white stroke for legibility.
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
      return d.name;
    });

  var path_label = svg
    .append("svg:g")
    .selectAll(".path_label")
    .data(force.links())
    .enter()
    .append("svg:text")
    .attr("class", "path_label")
    .append("svg:textPath")
    .attr("startOffset", "50%")
    .attr("text-anchor", "middle")
    .attr("xlink:href", function(d) {
      return "#" + d.source.index + "_" + d.target.index;
    })
    .style("fill", "#000")
    .style("font-family", "Arial")
    .text(function(d) {
      return d.value;
    });

  svg
    .style("opacity", 1e-6)
    .transition()
    .duration(1000)
    .style("opacity", 1);

  node.on("click", function(d) {
    d.fixed = true;
  });

  node.on("dblclick", function(d) {
    d.fixed = false;
  });

  node.append("title").text(function(d) {
    return d.name;
  });

  force.on("tick", function(e) {
    var k = 6 * e.alpha;
    if (booleanResized == true) {
      (width = $(window).width()), (height = $(window).height());
      force.size([width, height]).resume();
      booleanResized = false;
    }

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
        return (d.x = Math.max(r, Math.min(w - r, d.x)));
      })
      .attr("cy", function(d) {
        return (d.y = Math.max(r, Math.min(h - r, d.y)));
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
  d3.selectAll(".node")
    .attr("r", 15)
    .style("stroke", "black");
  //d3.selectAll(".link").style("stroke","black").style("stroke-width",4);
  d3.selectAll(".link")
    .transition()
    .duration(500)
    .style("opacity", function(o) {
      return o.source === d || o.target === d ? 1 : 0.1;
    });

  d3.selectAll(".node")
    .transition()
    .duration(500)
    .style("opacity", function(o) {
      return neighboring(d, o) ? 1 : 0.1;
    });
}

function mouseout() {
  d3.selectAll(".node")
    .attr("r", 8)
    .style("stroke", "white");
  d3.selectAll(".link")
    .style("stroke", "grey")
    .style("stroke-width", 1);
  d3.selectAll(".link")
    .transition()
    .duration(500)
    .style("opacity", 1);
  d3.selectAll(".node")
    .transition()
    .duration(500)
    .style("opacity", 1);
}

var booleanResized;
window.onresize = function() {
  booleanResized = true;
};
