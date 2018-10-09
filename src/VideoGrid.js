import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import store from "./store.js";
import { withRouter } from "react-router";

const axios = require("axios");

class Video extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    console.log("web video link " + this.props.video.webContentLink);
    console.log(this.props.video);

    var url;
    axios
      .post("http://sdi.myftp.org:81/video-editor/dropbox/getDirectLink", this.props.video, {
        withCredentials: true,
        responseType: "json",
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN"
      })
      .then(result => {
        var video = result.data;
        console.log("got url: " + video.directContentLink);
        this.props.changeVideoCallback(video, false);
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    return (
      <StyledVideoBox>
        <StyledVideoThumb>
          <div onClick={this.handleClick}>
            <img
              src={this.props.video.thumbnailLink}
              alt={this.props.video.name}
              width="128px"
              height="72px"
              onClick={this.props.handleClick}
            />
          </div>
        </StyledVideoThumb>
        <p
          style={{
            position: "absolute",
            bottom: "0px",
            margin: "3px",
            fontSize: "12px"
          }}>
          {this.props.video.name}
        </p>
      </StyledVideoBox>
    );
  }
}

const StyledVideoBox = styled.div`
  display: inline-block;
  position: relative;
  width: 100px;
  height: 120px;
  padding: 5px;
  border: 1px solid grey;
`;

const StyledVideoThumb = styled.div`
  position: absolute;
  display: block;
  top: 5px;
  width: 128px;
  height: 72px;
  background-size: cover;
  z-index: 20;
  border: 1px dotted green;
`;

class VideoGrid extends Component {
  render() {
    var videos = [];

    this.props.videos.forEach(video => {
      var width = 0;
      var height = 0;
      if (this.props.chosenResolution !== "") {
        width = this.props.resolutions[this.props.chosenResolution].width;
        height = this.props.resolutions[this.props.chosenResolution].height;
      }

      if (
        video.name.indexOf(this.props.filterText) === -1 ||
        (width !== 0 && video.width !== width && height !== 0 && video.height !== height)
      ) {
        return;
      }
      videos.push(
        <Video
          video={video}
          key={video.name}
          changeVideoCallback={this.props.changeVideoCallback}
        />
      );
    });

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
        {videos}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginType: state.loginType
  };
};

export default connect(mapStateToProps)(withRouter(VideoGrid));
