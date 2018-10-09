import React, { Component } from "react";
import Dropdown from "react-dropdown";
import FontAwesome from "react-fontawesome";

const axios = require("axios");
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

export default class Compilations extends React.Component {
  constructor(props) {
    super(props);
    console.log("before comp names");
    this.state = {
      compilations: {},
      defaultCompilation: 0
    };
    axios
      .post(
        "http://sdi.myftp.org:81/video-editor/user/compilations/list/mail/",
        { mail: this.props.userMail },
        {
          withCredentials: true,
          responseType: "json",
          xsrfCookieName: "XSRF-TOKEN",
          xsrfHeaderName: "X-XSRF-TOKEN"
        }
      )
      .then(result => {
        const compilations = {};
        result.data.forEach(c => (compilations[c.name] = c));
        this.setState({
          compilations: compilations
        });
        console.log("got results: " + result.data);
        if (typeof result.data !== "undefined" && result.data.length > 0) {
          this.changeCompilation(result.data[0]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  changeCompilation = e => {
    const name = e.value;
    this.props.setCompilationCallback(this.state.compilations[name]);
  };

  addNewCompilation = e => {};

  render() {
    return (
      <div>
        <div
          style={{
            position: "relative",
            display: "inline",
            marginRight: "60px"
          }}>
          Compilation:
        </div>
        <div
          style={{
            position: "absolute",
            display: "inline",
            marginRight: "20px",
            zIndex: "200",
            backgroundColor: "white",
            padding: "1px 5px 5px 5px"
          }}>
          <Dropdown
            style={{ border: "1px solid lightgray" }}
            options={Object.keys(this.state.compilations)}
            onChange={this.changeCompilation}
            value={this.state.defaultCompilation}
            placeholder="Select"
          />
        </div>
        <div style={{ display: "inline", marginRight: "10px", marginLeft: "10px" }}>
          add new
          <input
            type="text"
            style={{ width: "90px" }}
            name="newCompilationName"
            placeholder="type a name"
          />
          <FontAwesome
            className="fa fa-plus"
            name="plus"
            style={{
              textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
              margin: "0 5px",
              color: "#57c5f7"
            }}
          />
        </div>
        <div style={{ display: "inline", marginRight: "10px" }}>
          settings
          <FontAwesome
            className="fa fa-sliders"
            name="sliders"
            style={{
              textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
              margin: "0 5px",
              color: "#57c5f7"
            }}
          />
        </div>
        <div style={{ display: "inline", marginRight: "10px" }}>
          delete
          <FontAwesome
            className="fa fa-trash-o"
            name="trash-o"
            style={{
              textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
              margin: "0 5px",
              color: "#57c5f7"
            }}
          />
        </div>
      </div>
    );
  }
}
