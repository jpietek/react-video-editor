import React, { Component } from "react";
import ReactPlayer from "react-player";
import Tooltip from "rc-tooltip";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import Duration from "./Duration";
import FontAwesome from "react-fontawesome";
import ReactDOM from "react-dom";

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

function format(seconds) {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function pad(string) {
  return ("0" + string).slice(-2);
}

const handle = props => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}>
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      url: null,
      playing: true,
      volume: 0,
      played: 0,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      disableInOutSilder: false,
      zoom: 1.0,
      leftZoom: 0,
      rightZoom: 1,
      range: [this.props.inPoint, this.props.outPoint],
      mouseX: 0,
      mouseY: 0
    };
  }

  componentWillMount() {
    window.addEventListener("resize", this.handleRangeKnobs);
  }

  componentDidMount() {
    this.handleRangeKnobs();
  }

  onMouseMove = e => {
    this.setState({ mouseX: e.pageX, mouseY: e.pageY });
  };

  seek = seekPoint => {
    this.setState({
      seeking: false
    });
    this.player.seekTo(parseFloat(seekPoint));
    this.setState({
      playing: false
    });
  };

  toggleInOutSlider = flag => {
    const newRange = flag ? this.state.range : [];
    this.setState({
      disableInOutSilder: flag,
      range: newRange
    });
  };

  load = url => {
    this.setState({
      url,
      played: 0,
      loaded: 0
    });
  };
  forcePlay = () => {
    if (!this.state.playing) {
      this.setState({
        playing: true
      });
    }
  };

  playPause = () => {
    this.setState({
      playing: !this.state.playing
    });
  };

  getPlayed = () => {
    console.log("ret: " + this.state.played);
    return this.state.played;
  };

  stop = () => {
    this.setState({
      url: null,
      playing: false
    });
  };
  setVolume = e => {
    this.setState({
      volume: parseFloat(e)
    });
  };
  setPlaybackRate = e => {
    console.log(parseFloat(e.target.value));
    this.setState({
      playbackRate: parseFloat(e.target.value)
    });
  };
  onSeekMouseDown = e => {
    this.setState({
      seeking: true
    });
  };

  seekRelative(seek) {
    console.log("relative seek: " + this.state.played + " " + seek);
    const newSeek = this.state.played + seek;
    console.log("new seek: " + newSeek);
    this.setState({
      played: newSeek
    });
    this.player.seekTo(newSeek);
    this.props.updateVideoPositionCallback(newSeek);
  }

  onSeekChange = e => {
    this.props.updateVideoPositionCallback(this.state.played);
    this.setState({
      played: parseFloat(e)
    });
    var seekVal = parseFloat(e);
    if (this.player === null) {
      this.setState({
        playing: false
      });
    } else {
      this.player.seekTo(seekVal);
    }
  };

  setRange = e => {
    this.setState({
      range: e
    });
  };

  setInRange = inPoint => {
    const curRange = this.state.range.slice();
    curRange[0] = inPoint;
    this.setState({
      range: curRange
    });
  };

  setOutRange = outPoint => {
    const curRange = this.state.range.slice();
    curRange[1] = outPoint;
    this.setState({
      range: curRange
    });
  };

  onZoomChange = e => {
    let zoomLeft = this.state.leftZoom;
    let zoomRight = this.state.rightZoom;

    const range = (zoomRight - zoomLeft) * this.state.duration;
    const zoomChange = this.state.zoom - e;
    console.log("range: " + range);
    if (range < 5 && zoomChange > 0) {
      console.log("return");
      return;
    }

    const distLeft = Math.abs(this.state.played - zoomLeft);
    const distRight = Math.abs(zoomRight - this.state.played);

    if (Math.abs(distLeft - distRight) <= 0.05 || zoomChange < 0) {
      zoomLeft += zoomChange;
      zoomRight -= zoomChange;
    } else if (zoomChange > 0) {
      if (distRight - distLeft > 0.05) {
        zoomRight -= zoomChange;
      } else if (distLeft - distRight > 0.05) {
        zoomLeft += zoomChange;
      }
    }

    if (zoomRight > zoomLeft) {
      this.setState({
        zoom: e,
        leftZoom: Math.max(0, zoomLeft),
        rightZoom: Math.min(1, zoomRight)
      });
    }
  };

  handleRangeKnobs = () => {
    const rangeElement = ReactDOM.findDOMNode(this.refs.range);
    const rect = rangeElement.getBoundingClientRect();
    const rectSize = rect.right - rect.left;
    const leftHandlePos = this.state.range[0] * rectSize;
    const rightHandlePos = this.state.range[1] * rectSize;

    this.setState({
      leftHandlePos: leftHandlePos,
      rightHandlePos: rightHandlePos,
      rangeLeft: rect.left,
      rangeRight: rect.right
    });
  };

  onRangeChange = e => {
    this.setRange(e);
    if (e[0] !== this.props.inPoint) {
      this.player.seekTo(e[0]);
      this.props.setInCallback(e[0]);
    } else if (e[1] !== this.props.outPoint) {
      this.player.seekTo(e[1]);
      this.props.setOutCallback(e[1]);
    }

    const rangeElement = ReactDOM.findDOMNode(this.refs.range);
    const rect = rangeElement.getBoundingClientRect();
    const rectSize = rect.right - rect.left;
    const leftHandlePos = e[0] * rectSize;
    const rightHandlePos = e[1] * rectSize;

    this.setState({
      leftHandlePos: leftHandlePos,
      rightHandlePos: rightHandlePos,
      rangeLeft: rect.left,
      rangeRight: rect.right
    });
  };

  onRangeSeekMouseUp = e => {
    this.setState({
      seeking: false
    });
    console.log(e);

    const mouseX = this.state.mouseX;
    const mouseY = this.state.mouseY;
    const leftHandleDist = Math.abs(
      this.state.mouseX - this.state.rangeLeft - this.state.leftHandlePos
    );
    const rightHandleDist = Math.abs(
      this.state.mouseX - this.state.rangeLeft - this.state.rightHandlePos
    );
    console.log("pos: " + this.state.leftHandlePos + " " + this.state.rightHandlePos);
    console.log("rect: " + this.state.rangeLeft + " " + this.state.rangeRight);
    console.log("mouse: " + this.state.mouseX + " " + this.state.mouseY);
    console.log("diff: " + leftHandleDist + " " + rightHandleDist);
    const seekPoint = leftHandleDist < rightHandleDist ? e[0] : e[1];
    const seekPointFloat = parseFloat(seekPoint);
    console.log("update seek point: " + seekPointFloat);
    this.player.seekTo(seekPointFloat);
    this.props.updateVideoPositionCallback(seekPointFloat);
    this.setState({
      played: seekPointFloat,
      playing: false
    });
  };

  onSeekMouseUp = e => {
    this.setState({
      seeking: false
    });
    this.player.seekTo(e);
  };

  onProgress = state => {
    if (this.state.playing) {
      this.props.updateVideoPositionCallback(this.state.played);
      if (!this.state.seeking) {
        this.setState(state);
      }
    }
  };

  render() {
    const {
      url,
      playing,
      volume,
      played,
      loaded,
      duration,
      playbackRate,
      soundcloudConfig,
      vimeoConfig,
      youtubeConfig,
      fileConfig,
      zoom,
      leftZoom,
      rightZoom,
      disableInOutSilder,
      range,
      leftHandlePos,
      rightHandlePos
    } = this.state;

    const marks = {};
    if (range.length === 2) {
      marks[range[0]] = {
        label: "start",
        style: { position: "absolute", top: "-7px" }
      };
      marks[range[1]] = {
        label: "end",
        style: { top: "-7px" }
      };
    }

    const SEPARATOR = " · ";

    const zoomStyle = {
      marginLeft: leftZoom * 100 + "%",
      width: (rightZoom - leftZoom) * 100 + "%",
      height: "10px",
      backgroundColor: "lightgray",
      borderRadius: "3px"
    };
    const selectionStyle = {
      position: "absolute",
      top: "0",
      left: range[0] * 100 + "%",
      width: (range[1] - range[0]) * 100 + "%",
      height: "10px",
      backgroundColor: "rgba(87, 197, 247, 0.6)",
      borderRadius: "3px",
      zIndex: "100"
    };

    const playheadStyle = {
      position: "absolute",
      marginLeft: "-4px",
      left: played * 100 + "%",
      textAlign: "center",
      lineHeight: "0.2",
      top: "-6px"
    };

    const leftLineStyle = {
      position: "absolute",
      left: leftHandlePos + "px",
      marginLeft: "0px",
      top: "0"
    };
    const rightLineStyle = {
      position: "absolute",
      left: rightHandlePos + "px",
      marginLeft: "0px",
      top: "0"
    };

    return (
      <div onMouseMove={this.onMouseMove}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "50vh",
            margin: "0",
            backgroundColor: "lightgray"
          }}>
          <ReactPlayer
            ref={player => {
              this.player = player;
            }}
            className="react-player"
            width="100%"
            height="100%"
            style={{ margin: "0 auto", zIndex: "101" }}
            url={this.props.video === undefined ? "" : this.props.video.directContentLink}
            playing={playing}
            playbackRate={playbackRate}
            progressFrequency={200}
            volume={volume}
            onPlay={() =>
              this.setState({
                playing: true
              })}
            onPause={() =>
              this.setState({
                playing: false
              })}
            onBuffer={() => console.log("buffering!!!")}
            onEnded={() =>
              this.setState({
                playing: false
              })}
            onError={e => console.log("onError", e)}
            onProgress={this.onProgress}
            onDuration={duration => {
              this.setState({
                duration
              });
            }}
          />
        </div>
        <div>
          <br />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              position: "relative",
              justifyContent: "space-between",
              alignItems: "stretch",
              margin: "0",
              padding: "0"
            }}>
            <div
              style={{
                width: "22%",
                display: "inline-block"
              }}>
              <div
                onClick={this.playPause}
                style={{
                  display: "inline-block"
                }}>
                <div style={{ display: "inline-block" }}>
                  {!playing
                    ? <FontAwesome
                        className="fa fa-play"
                        name="play"
                        style={{
                          textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                          marginRight: "15px",
                          color: "#57c5f7"
                        }}
                      />
                    : <FontAwesome
                        className="fa fa-pause"
                        name="pause"
                        style={{
                          textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                          marginRight: "15px",
                          color: "#57c5f7"
                        }}
                      />}
                </div>

                <div style={{ display: "inline-block", fontSize: "10px" }}>
                  <Duration seconds={duration * played} /> /{" "}
                  <Duration seconds={duration} />
                </div>
              </div>

              <div
                style={{
                  display: "block",
                  verticalAlign: "middle"
                }}>
                <div style={{ display: "inline-block", verticalAlign: "super" }}>
                  <FontAwesome
                    className="fa fa-volume-up"
                    name="volume-up"
                    style={{
                      textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                      marginRight: "15px",
                      color: "#57c5f7"
                    }}
                  />
                </div>

                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={this.setVolume}
                  handleStyle={{ width: "8px", height: "8px", marginTop: "-2px" }}
                  style={{
                    margin: "0",
                    padding: "0",
                    width: "60%",
                    display: "inline-block",
                    verticalAlign: "-webkit-baseline-middle"
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "inline-block",
                width: "75%"
              }}>
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  justifyContent: "space-between",
                  width: "78%",
                  height: "40px",
                  top: "-1px",
                  marginLeft: "-11px"
                }}>
                <div
                  style={{
                    textAlign: "center",
                    lineHeight: "0.2",
                    fontSize: "10px"
                  }}>
                  <p style={{ color: "lightgray" }}>&#124;</p>
                  <p>
                    <Duration seconds={duration * leftZoom} />
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    lineHeight: "0.2",
                    fontSize: "10px"
                  }}>
                  <p style={{ color: "lightgray" }}>&#124;</p>
                  <p>
                    <Duration
                      seconds={duration * (leftZoom + (rightZoom - leftZoom) / 3)}
                    />
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    lineHeight: "0.2",
                    fontSize: "10px"
                  }}>
                  <p style={{ color: "lightgray" }}>&#124;</p>
                  <p>
                    <Duration
                      seconds={duration * (leftZoom + 2 * (rightZoom - leftZoom) / 3)}
                    />
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    lineHeight: "0.2",
                    fontSize: "10px"
                  }}>
                  <p style={{ color: "lightgray" }}>&#124;</p>
                  <p>
                    <Duration seconds={duration * rightZoom} />
                  </p>
                </div>
              </div>
              <Slider
                min={leftZoom}
                max={rightZoom}
                step={
                  this.props.video.frameCount ? 1 / this.props.video.frameCount : 0.00001
                }
                value={played}
                onBeforeChange={this.onSeekMouseDown}
                onChange={this.onSeekChange}
                onAfterChange={this.onSeekMouseUp}
                style={{
                  display: "block",
                  margin: "10px 0 20px 0",
                  padding: "0",
                  width: "100%"
                }}
              />
              <div
                style={{
                  position: "relative"
                }}>
                <div style={playheadStyle}>
                  <FontAwesome
                    aria-hidden="true"
                    className="fa fa-caret-down"
                    name="caret-down"
                    style={{
                      textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                      margin: "0",
                      marginTop: "-5px",
                      color: "#57c5f7"
                    }}
                  />
                  <p
                    style={{
                      color: "gray",
                      zIndex: "100",
                      top: "0",
                      left: "3px",
                      fontSize: "10px",
                      position: "absolute"
                    }}>
                    &#124;
                  </p>
                </div>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "10px",
                    border: "1px solid lightgray",
                    borderRadius: "3px"
                  }}>
                  <div style={zoomStyle} />
                  <div style={selectionStyle} />
                </div>

                <div style={leftLineStyle}>
                  <p
                    style={{
                      color: "rgba(87, 197, 247, 0.6)",
                      zIndex: "100",
                      top: "0",
                      left: "0",
                      fontSize: "8px",
                      fontWeight: "bolder",
                      position: "absolute"
                    }}>
                    |
                  </p>
                </div>

                <div style={rightLineStyle}>
                  <p
                    style={{
                      color: "rgba(87, 197, 247, 0.6)",
                      fontWeight: "bolder",
                      zIndex: "100",
                      top: "0",
                      left: "0",
                      fontSize: "8px",
                      position: "absolute"
                    }}>
                    |
                  </p>
                </div>

                <Range
                  min={0}
                  max={1}
                  ref="range"
                  style={{
                    display: "block",
                    margin: "10px auto",
                    padding: "0"
                  }}
                  railStyle={{ backgroundColor: "white" }}
                  trackStyle={[{ backgroundColor: "white" }]}
                  step={
                    this.props.video.frameCount
                      ? 1 / this.props.video.frameCount
                      : 0.00001
                  }
                  marks={marks}
                  tipFormatter={value => {
                    return format(value * duration);
                  }}
                  defaultValue={[this.props.inPoint, this.props.outPoint]}
                  value={range}
                  onBeforeChange={this.onSeekMouseDown}
                  onChange={this.onRangeChange}
                  onAfterChange={this.onRangeSeekMouseUp}
                  onClick={() => {
                    console.log("dupa");
                  }}
                  allowCross={false}
                  disabled={this.disableInOutSlider}
                  pushable={0.03}
                />
              </div>

              <div
                style={{
                  float: "right",
                  width: "30%",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  justifyContent: "space-between"
                }}>
                <FontAwesome
                  aria-hidden="true"
                  className="fa fa-search-plus"
                  name="search-plus"
                  style={{
                    textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                    margin: "0",
                    marginTop: "-5px",
                    color: "#57c5f7"
                  }}
                />
                <Slider
                  min={0}
                  max={1}
                  value={zoom}
                  onBeforeChange={() => {
                    this.setState({
                      playing: false
                    });
                  }}
                  onChange={this.onZoomChange}
                  onAfterChange={() => {
                    this.setState({
                      playing: true
                    });
                  }}
                  style={{
                    display: "inline-block",
                    margin: "0 auto",
                    padding: "0",
                    width: "65%"
                  }}
                  step={0.01}
                />
                <FontAwesome
                  aria-hidden="true"
                  className="fa fa-search-minus"
                  name="search-minus"
                  style={{
                    textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                    margin: "0",
                    marginTop: "-5px",
                    color: "#57c5f7"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default VideoPlayer;
