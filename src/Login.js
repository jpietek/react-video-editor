import React, { Component } from "react";
import { connect } from "react-redux";
import store from "./store.js";
import { withRouter } from "react-router";

export class Login extends Component {
  loginGoogle = () => {
    this.props.dispatch({
      type: "LOGIN_TYPE",
      loginType: "google"
    });
  };

  loginDropbox = () => {
    this.props.dispatch({
      type: "LOGIN_TYPE",
      loginType: "dropbox"
    });
  };

  render() {
    return (
      <div>
        <a href="http://sdi.myftp.org:81/video-editor/logout">logout</a>
        <a onClick={this.loginGoogle} href="http://sdi.myftp.org:81/video-editor/login/google">
          google
        </a>
        <a onClick={this.loginDropbox} href="http://sdi.myftp.org:81/video-editor/login/dropbox">
          dropbox
        </a>
      </div>
    );
  }
}
export default connect()(withRouter(Login));
