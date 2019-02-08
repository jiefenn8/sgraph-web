import React, { Component } from "react";

class Graph extends Component {
  state = {
    depth: 0
  };

  styles = {
    fontSize: 10,
    fontWeight: "bold"
  };

  render() {
    return (
      <div>
        <span style={this.styles} className="badge badge-primary m-2">
          {this.state.depth}
        </span>
        <button className="btn btn-secondary btn-sm">+</button>
      </div>
    );
  }
}
export default Graph;
