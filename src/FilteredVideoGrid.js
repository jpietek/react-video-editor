import React, { Component } from "react";
import { connect } from "react-redux";
import store from "./store.js";
import { withRouter } from "react-router";
import SearchBar from "./SearchBar";
import VideoGrid from "./VideoGrid";
import VideoPlayer from "./VideoPlayer";
import Login from "./Login";
import Sequence from "./Sequence";
import cloneDeep from "clone-deep";
import Dropdown from "react-dropdown";
import FontAwesome from "react-fontawesome";
import Compilations from "./Compilations";

import {
  Router,
  Route,
  Redirect,
  IndexRoute,
  Link,
  hashHistory,
  browserHistory
} from "react-router";

const axios = require("axios");
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

var resolutions = {
  fullHD: {
    width: 1920,
    height: 1080
  },
  HD: {
    width: 720,
    height: 480
  }
};

class FilteredVideoGrid extends React.Component {
  constructor(props) {
    super(props);
    console.log("constructor executed");
    this.state = {
      filterText: "",
      chosenResolution: "",
      chosenVideo: "",
      inPoint: 0,
      outPoint: 0,
      sequenceId: 0,
      currentVideoPosition: 0,
      curCompilation: { videos: [], duration: 0, name: "untitled" }
    };
  }

  setCompilationCallback = compilation => {
    console.log("change compilation");
    console.log(compilation);
    const firstVideo = compilation.videos[0];
    this.setState(
      {
        chosenVideo: firstVideo,
        inPoint: firstVideo.cutIn,
        outPoint: firstVideo.cutOut
      },
      () => {
        this.refs.sequence.updateCompilation(compilation);
        this.refs.player.onRangeChange([firstVideo.cutIn, firstVideo.cutOut]);
        this.refs.player.seek(firstVideo.cutIn);
        this.changeInOut(firstVideo);
      }
    );
  };

  setIn = cutIn => {
    const video = cloneDeep(this.state.chosenVideo);
    video.cutIn = cutIn;
    this.setState({
      inPoint: cutIn,
      chosenVideo: video
    });
    this.refs.sequence.updateVideo(this.state.sequenceId, cutIn, this.state.outPoint);
  };

  setOut = cutOut => {
    const video = cloneDeep(this.state.chosenVideo);
    video.cutOut = cutOut;
    this.setState({
      outPoint: cutOut,
      chosenVideo: video
    });
    this.refs.sequence.updateVideo(this.state.sequenceId, this.state.inPoint, cutOut);
  };

  previewSequence = () => {};

  updateCurrentVideoPosition = position => {
    this.setState({
      currentVideoPosition: position
    });
  };

  changeVideo = (video, autoplay) => {
    console.log("changing video, new: " + video);
    video.cutIn = 0;
    video.cutOut = 0.3;
    const seqId =
      video.sortId !== undefined ? video.sortId : this.refs.sequence.getCurId();
    video.sortId = seqId;
    console.log("change seq id: " + seqId);
    this.setState(
      {
        chosenVideo: video,
        sequenceId: seqId,
        inPoint: 0,
        outPoint: 0.3
      },
      () => {
        this.refs.player.setRange([0, 0.3]);
        if (video.name !== null) {
          this.refs.sequence.add(video);
        }
        if (autoplay) {
          console.log("playpause");
          this.refs.player.forcePlay();
        }
      }
    );
  };

  changeInOut = video => {
    console.log("inside inout " + video.sortId + " " + video.cutIn + " " + video.cutOut);
    this.refs.sequence.updateVideo(
      this.state.sequenceId,
      this.state.inPoint,
      this.state.outPoint
    );
    this.setState({
      chosenVideo: video,
      inPoint: video.cutIn,
      outPoint: video.cutOut,
      sequenceId: video.sortId
    });
    this.refs.player.seek(video.cutIn);
    this.refs.player.setRange([video.cutIn, video.cutOut]);
    this.refs.sequence.setRenderState("before");
  };

  renderSequence = () => {
    const compilation = this.refs.sequence.createSequence();
    compilation.userMail = this.props.userMail;
    compilation.name = "untitled";
    console.log("render compilation:  " + compilation);
    axios
      .post("http://sdi.myftp.org:81/video-editor/render", compilation, {
        withCredentials: true,
        responseType: "json",
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN"
      })
      .then(result => {
        if (!result.data.success) {
          alert(result.data.msg);
        }

        this.changeVideo(result.data.result, true);
        this.refs.sequence.setRenderState("after");
        this.refs.player.toggleInOutSlider(false);
        this.refs.sequence.setSequencePlay(true);
      })
      .catch(err => {
        console.log("render http error");
        this.refs.sequence.setRenderState("before");
        this.refs.player.toggleInOutSlider(true);
      });
  };

  handleFilterTextInput = filterText => {
    this.setState({
      filterText: filterText
    });
  };

  handleRadioInput = chosenResolution => {
    this.setState({
      chosenResolution: chosenResolution
    });
  };

  handleKeyPress = event => {
    console.log("event key: " + event.key);
    if (event.key === "i") {
      if (this.state.currentVideoPosition >= this.state.outPoint) {
        return;
      }
      this.refs.sequence.updateVideo(
        this.state.sequenceId,
        this.state.currentVideoPosition,
        this.state.outPoint
      );
      this.setState({
        inPoint: this.state.currentVideoPosition
      });
      this.refs.player.setInRange(this.state.currentVideoPosition);
    } else if (event.key === "o") {
      if (this.state.currentVideoPosition <= this.state.inPoint) {
        return;
      }
      this.refs.sequence.updateVideo(
        this.state.sequenceId,
        this.state.inPoint,
        this.state.currentVideoPosition
      );
      this.setState({
        outPoint: this.state.currentVideoPosition
      });
      this.refs.player.setOutRange(this.state.currentVideoPosition);
      console.log("o: " + this.state.currentVideoPosition);
    } else if (event.key === "k" || event.key === " ") {
      this.refs.player.playPause();
    } else if (event.key === "j") {
      this.refs.player.seekRelative(
        -this.state.chosenVideo.fps / this.state.chosenVideo.frameCount
      );
    } else if (event.key === "l") {
      this.refs.player.seekRelative(
        this.state.chosenVideo.fps / this.state.chosenVideo.frameCount
      );
    } else if (event.key === ",") {
      this.refs.player.seekRelative(-1 / this.state.chosenVideo.frameCount);
    } else if (event.key === ".") {
      this.refs.player.seekRelative(1 / this.state.chosenVideo.frameCount);
    }
  };

  render() {
    return (
      <div
        tabIndex="0"
        onKeyPress={this.handleKeyPress}
        style={{
          fontFamily: "Lato, sans-serif",
          fontWeight: "400",
          width: "90vw",
          margin: "0 auto"
        }}>
        <div style={{ display: "block", clear: "both", margin: "5px 0" }}>
          <div style={{ display: "inline", marginRight: "20px" }}>
            logged user: {this.props.userName}
          </div>
          <Compilations
            userMail={this.props.userMail}
            setCompilationCallback={this.setCompilationCallback}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
          <div
            className="playerContainer"
            style={{
              display: "inline",
              width: "70vw",
              height: "60vh",
              float: "left",
              border: "1px dotted pink"
            }}>
            <VideoPlayer
              video={this.state.chosenVideo}
              setInCallback={this.setIn}
              setOutCallback={this.setOut}
              inPoint={this.state.inPoint}
              outPoint={this.state.outPoint}
              updateVideoPositionCallback={this.updateCurrentVideoPosition}
              handleKeyPressCallback={this.handleKeyPress}
              ref="player"
              style={{ border: "1px dotted green" }}
            />
          </div>

          <div
            className="moviesCatalogue"
            style={{
              display: "inline",
              marginLeft: "20px",
              width: "30vw",
              height: "70vh",
              float: "right",
              border: "1px dotted red",
              overflowY: "auto"
            }}>
            <SearchBar
              filterText={this.state.filterText}
              onFilterTextInput={this.handleFilterTextInput}
              onRadioInputChange={this.handleRadioInput}
              resolutions={resolutions}
            />
            <VideoGrid
              filterText={this.state.filterText}
              chosenResolution={this.state.chosenResolution}
              inPoint={this.state.inPoint}
              outPoint={this.state.outPoint}
              changeVideoCallback={this.changeVideo}
              resolutions={resolutions}
              videos={this.props.videos}
            />
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            display: "block",
            border: "2px dotted green"
          }}>
          <Sequence
            ref="sequence"
            changeInOutCallback={this.changeInOut}
            renderCallback={this.renderSequence}
            playPauseRenderedSequenceCallback={this.playPauseRenderedSequence}
            playedPercentage={this.state.currentVideoPosition}
            curCompilation={this.state.curCompilation}
          />
        </div>
      </div>
    );
  }
}

FilteredVideoGrid.contextTypes = {
  router: React.PropTypes.object.isRequired
};

const mapStateToProps = state => {
  return {
    userName: state.userName,
    userPhoto: state.userPhoto,
    userMail: state.userMail,
    videos: state.videos
  };
};

export default connect(mapStateToProps)(withRouter(FilteredVideoGrid));
