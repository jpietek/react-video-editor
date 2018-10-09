import React, { Component } from "react";

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: 0
    };
  }
  render() {
    const position = this.props.playHeadMargin + "px";

    return (
      <div
        style={{
          position: "absolute",
          marginLeft: `${position}`,
          height: "90px",
          width: "1px",
          zIndex: "20",
          borderRight: "3px solid red"
        }}
      />
    );
  }
}

export default ProgressBar;
