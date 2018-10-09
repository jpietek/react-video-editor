import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import store from "./store.js";
import { Provider } from "react-redux";
import Editor from "./Editor.js";

import registerServiceWorker from "./registerServiceWorker";

const EditorWithStore = (
  <Provider store={store}>
    <Editor />
  </Provider>
);

ReactDOM.render(EditorWithStore, document.getElementById("container"));
registerServiceWorker();
