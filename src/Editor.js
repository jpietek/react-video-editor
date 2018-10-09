import React, { Component } from "react";
import {
  Router,
  Route,
  IndexRoute,
  Link,
  hashHistory,
  browserHistory
} from "react-router";
import FilteredVideoGrid from "./FilteredVideoGrid";
import Login from "./Login";
import Layout from "./Layout";

class Editor extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Layout} />
        <Route path="editor" component={FilteredVideoGrid} />
        <Route path="login" component={Login} />
      </Router>
    );
  }
}

export default Editor;
