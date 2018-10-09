import React, { Component } from "react";

class ResolutionRadioItem extends React.Component {
  render() {
    return (
      <p>
        <input
          type="radio"
          name="resolution"
          checked={this.props.name === this.props.currentResolution}
          onChange={this.props.changeCallback}
          value={this.props.name}
        />
        {this.props.name}
      </p>
    );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterTextInputChange = this.handleFilterTextInputChange.bind(
      this
    );
    this.handleRadioInputChange = this.handleRadioInputChange.bind(this);
    this.state = {
      chosenResolution: ""
    };
  }
  handleFilterTextInputChange(e) {
    this.props.onFilterTextInput(e.target.value);
  }
  handleRadioInputChange(e) {
    this.props.onRadioInputChange(e.target.value);
    this.state.chosenResolution = e.target.value;
  }

  render() {
    var resolutionsList = [];

    Object.keys(this.props.resolutions).forEach(res => {
      resolutionsList.push(
        <ResolutionRadioItem
          name={res}
          key={res}
          changeCallback={this.handleRadioInputChange}
          currentResolution={this.state.chosenResolution}
        />
      );
    });

    return (
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={this.props.filterText}
          onChange={this.handleFilterTextInputChange}
        />
        <ibody>
          {" "}{resolutionsList}{" "}
        </ibody>
      </form>
    );
  }
}

export default SearchBar;
