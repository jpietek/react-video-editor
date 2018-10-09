import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import store from "./store.js";
import { Link } from "react-router";
import FilteredVideoGrid from "./FilteredVideoGrid";
import Login from "./Login";

const axios = require("axios");
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

export class Layout extends Component {
  constructor(props) {
    super(props);
    console.log("layout const");
    axios
      .get("http://sdi.myftp.org:81/video-editor/user")
      .then(result => {
        console.log(result);
        this.props.userName = result.data.name;
        this.props.userPhoto = result.data.userAuthentication.details.picture;
        this.props.userMail = result.data.userAuthentication.details.email;

        this.props.dispatch({
          type: "LOGIN",
          userName: this.props.userName,
          userPhoto: this.props.userPhoto,
          userMail: this.props.userMail
        });
      })
      .catch(err => {
        console.log("login err");
        this.props.router.push("login");
      });

    axios
      .get("http://sdi.myftp.org:81/video-editor/dropbox/list/thumbsize/med")
      .then(result => {
        this.props.dispatch({
          type: "LIST",
          videos: result.data
        });
        this.props.router.push("editor");
      })
      .catch(err => {
        console.log("error while rendering editor");
        console.log(err);
        this.props.router.push("login");
      });
  }
  render() {
    return <div />;
  }
}

const mapStateToProps = state => {
  return {
    loginType: state.loginType
  };
};

export default connect(mapStateToProps)(withRouter(Layout));
