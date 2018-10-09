import React, { Component } from "react";
import { SortableContainer, SortableElement, arrayMove } from "react-sortable-hoc";
import cloneDeep from "clone-deep";
import styled from "styled-components";
import FontAwesome from "react-fontawesome";
import Halogen from "halogen";
import ProgressBar from "./ProgressBar";

const StyledVideoContainer = styled.div`
  &:hover {
    background-color: gray;
  }

  &:active {
    background-color: #a9a;
    top: +2px;
  }
`;

const SortableItem = SortableElement(
  ({
    video,
    changeInOutCallback,
    removeCallback,
    duplicateCallback,
    setCurVideoIdCallback,
    borderSize
  }) =>
    <StyledVideoContainer
      onClick={() => {
        changeInOutCallback(video);
        console.log("set cur video id: " + video.sortId);
        setCurVideoIdCallback(video.sortId);
      }}
      distance="100"
      style={{
        position: "relative",
        width: "128px",
        height: "72px",
        backgroundImage: `url(${video.thumbnailLink})`,
        fontSize: "20px",
        textAlign: "center",
        border: `solid ${borderSize}px rgb(87, 197, 247)`,
        color: "white",
        borderRadius: "5px",
        float: "left"
      }}>
      <FontAwesome
        className="fa fa-clone"
        name="clone"
        onClick={() => {
          duplicateCallback(video.sortId);
        }}
        style={{
          textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: "4px",
          left: "5px",
          color: "#57c5f7",
          fontSize: "14px"
        }}
      />
      <FontAwesome
        className="fa fa-times"
        name="times"
        onClick={e => {
          removeCallback(e, video.sortId);
        }}
        style={{
          textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: "0px",
          right: "5px",
          color: "#57c5f7"
        }}
      />
    </StyledVideoContainer>
);

const SortableList = SortableContainer(
  ({
    videos,
    changeInOutCallback,
    removeCallback,
    duplicateCallback,
    setCurVideoIdCallback,
    curVideoId
  }) => {
    return (
      <div
        style={{
          border: "1px",
          width: "100%",
          height: "78px",
          display: "flex",
          overflowX: "hidden",
          overflowY: "hidden",
          flexWrap: "nowrap",
          justifyContent: "flex-start"
        }}>
        {videos.map((video, index) => {
          const borderSize = video.sortId === curVideoId ? 2 : 0;
          return (
            <SortableItem
              key={"video-" + index}
              index={index}
              video={video}
              changeInOutCallback={changeInOutCallback}
              removeCallback={removeCallback}
              duplicateCallback={duplicateCallback}
              setCurVideoIdCallback={setCurVideoIdCallback}
              borderSize={borderSize}
            />
          );
        })}
      </div>
    );
  }
);

export default class Sequence extends Component {
  constructor(props) {
    super(props);
    this.curId = 0;
    this.firstPlayCallback = 0;
    this.state = {
      list: this.props.curCompilation.videos,
      totalDuration: this.props.curCompilation.duration,
      renderState: "before",
      playingRenderedSequence: false,
      curVideoId: 0
    };
  }

  setCurVideoId = id => {
    this.setState({ curVideoId: id });
  };

  onResize(i) {
    console.log(`resize pane id = ${i}`);
  }

  setRenderState = state => {
    this.setState({
      renderState: state
    });
  };

  setSequencePlay() {
    this.setState({
      playingRenderedSequence: true
    });
  }

  updateCompilation = compilation => {
    this.setState({
      list: compilation.videos
    });
  };

  updateVideo = (seqId, cutIn, cutOut) => {
    var pos = this.state.list
      .map(function(video) {
        return video.sortId;
      })
      .indexOf(seqId);
    if (pos === -1) {
      return;
    }
    var videos = this.state.list.slice();
    this.state.list[pos].cutIn = cutIn;
    this.state.list[pos].cutOut = cutOut;
  };

  createSequence = () => {
    this.setRenderState("rendering");
    const renderList = this.state.list;
    const totalDuration = this.getTotalDuration(renderList);

    this.setState({
      renderedList: renderList,
      totalDuration: totalDuration
    });
    return { videos: renderList, totalDuration: totalDuration };
  };

  duplicate = sequenceId => {
    var copiedVideo = cloneDeep(this.state.list[sequenceId]);
    var id = this.curId++;
    copiedVideo.sortId = id;
    var videos = this.state.list.slice();
    videos.push(copiedVideo);

    this.setState({
      list: videos
    });
    this.setRenderState("before");
  };

  getCurId = () => {
    return this.curId;
  };

  getTotalDuration = videos => {
    return videos.reduce(function(a, b) {
      return a + (b.cutOut - b.cutIn) * b.duration;
    }, 0);
  };

  add = video => {
    var videos = this.state.list.slice();
    var id = this.curId;
    this.curId++;
    var copiedVideo = cloneDeep(video);
    copiedVideo.sortId = id;
    copiedVideo.cutDuration = (video.cutOut - video.cutIn) * video.duration;
    videos.push(copiedVideo);

    this.setState({
      list: videos
    });
  };

  remove = (e, id) => {
    e.preventDefault();
    var pos = this.state.list
      .map(function(video) {
        return video.sortId;
      })
      .indexOf(id);
    if (pos === -1) {
      return;
    }

    var videos = this.state.list.slice();
    videos.splice(pos, 1);
    this.setState({
      list: videos
    });
    this.setRenderState("before");
  };

  orderChanged = order => {
    this.setState({
      list: arrayMove(this.state.list, order.oldIndex, order.newIndex)
    });
  };

  renderPlayButton = () => {
    const activeStyle = {
      textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
      margin: "0",
      color: "#57c5f7",
      position: "relative",
      top: "40%",
      left: "3px",
      fontSize: "20px"
    };

    const disabledStyle = {
      textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
      margin: "0",
      color: "gray",
      position: "relative",
      top: "40%",
      left: "3px",
      fontSize: "20px",
      opacity: "0.6"
    };

    if (this.state.renderState === "before") {
      return (
        <FontAwesome
          className="fa fa-cog"
          name="cog"
          onClick={() => {
            this.props.renderCallback();
          }}
          style={activeStyle}
        />
      );
    } else if (this.state.renderState === "rendering") {
      return <FontAwesome className="fa fa-cog" name="cog" spin style={activeStyle} />;
    } else if (this.state.renderState === "after") {
      return <FontAwesome className="fa fa-cog" name="cog" style={disabledStyle} />;
    }
  };

  calculatePlayHeadMargin = () => {
    if (this.firstPlayCallback < 2) {
      this.firstPlayCallback++;
      return 0;
    }

    var playHeadMargin = 0;
    var consumedPercentage = 0;
    for (var i = 0; i < this.state.renderedList.length; i++) {
      const v = this.state.renderedList[i];
      var curDuration = (v.cutOut - v.cutIn) * v.duration;
      var curPercentage = curDuration / this.state.totalDuration;
      if (this.props.playedPercentage > 0.96) {
        return this.state.renderedList.length * 128;
      }

      consumedPercentage += curPercentage;

      if (this.props.playedPercentage < consumedPercentage) {
        playHeadMargin +=
          Math.abs(this.props.playedPercentage - consumedPercentage + curPercentage) /
          curPercentage *
          128;
        break;
      } else {
        playHeadMargin += 128;
      }
    }
    console.log("margin: " + playHeadMargin);
    return playHeadMargin;
  };

  render() {
    let playHeadMargin = 0;

    if (this.state.playingRenderedSequence) {
      playHeadMargin = this.calculatePlayHeadMargin();
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
          alignItems: "stretch",
          marginTop: "30px",
          width: "100%"
        }}>
        <div style={{ position: "relative", margin: "0 10px 0 5px" }}>
          {this.renderPlayButton()}
        </div>
        <div
          style={{
            position: "relative",
            width: "97%",
            height: "78px",
            backgroundColor: "lightgray"
          }}>
          {this.state.playingRenderedSequence
            ? <ProgressBar playHeadMargin={Math.ceil(playHeadMargin)} />
            : null}
          <SortableList
            videos={this.state.list}
            onSortEnd={this.orderChanged}
            changeInOutCallback={this.props.changeInOutCallback}
            removeCallback={this.remove}
            duplicateCallback={this.duplicate}
            setCurVideoIdCallback={this.setCurVideoId}
            curVideoId={this.state.curVideoId}
            axis="x"
            distance="30"
          />
        </div>
      </div>
    );
  }
}
