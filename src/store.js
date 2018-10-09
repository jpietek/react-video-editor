import { createStore, combineReducers, compose } from "redux";
import persistState from "redux-localstorage";
import { connect } from "react-redux";

const reducer = (state = 0, action) => {
  switch (action.type) {
    case "LOGIN_TYPE":
      return { ...state, loginType: action.loginType };
    case "LOGIN":
      return {
        ...state,
        userName: action.userName,
        userPhoto: action.userPhoto,
        userMail: action.userMail
      };
    case "LIST":
      console.log("setting videos " + action.videos);
      return { ...state, videos: action.videos };
    default:
      return state;
  }
};
const enhancer = compose(persistState("session"));

const store = createStore(reducer, {}, enhancer);

export default store;
