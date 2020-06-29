import React from "react";
import Draggable from "react-draggable";
import { MrtcFactory, IConnection, Logger } from "mark-ind-mrtc";
import { throttle } from "throttle-debounce";
import "react-chat-widget/lib/styles.css";
import "./App.css";
import { observer } from "mobx-react";
import SetupDialog from "./SetupDialog";
import XSnackbar from "./XSnackbar";

import {
  Widget,
  addResponseMessage,
  addUserMessage,
  toggleWidget,
} from "react-chat-widget";

import {
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ChatIcon from "@material-ui/icons/Chat";
import PhoneIcon from "@material-ui/icons/Phone";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";

import AppStore from "./AppStore";

Logger.configure({ level: "debug" });

const styles = ({ spacing, palette }: Theme) =>
  createStyles({
    root: {
      position: "relative",
      display: "inline-block",
    },
    video: {
      width: "100%!important",
    },
    toolbar: {
      top: 10,
      left: 10,
      position: "absolute",
      cursor: "pointer",
      zIndex: 99999,
    },
  });

interface AppProps extends WithStyles<typeof styles> {}

@observer
class App extends React.Component<AppProps> {
  private connection!: IConnection;

  public componentDidMount() {
    AppStore.connectMrtc = this.handleConnectMrtc;
  }

  private handleConnectMrtc = async () => {
    const video = document.getElementById("video") as HTMLMediaElement;
    const mrtc = MrtcFactory.build();

    try {
      await mrtc.connectServer(`td-agent-${AppStore.agentName}`, {
        // host: "localhost",
        // port: 9000,
        // path: "/myapp",
        config: {
          iceServers: [{ urls: "stun:turn.tdx.sandcitadel.com:443" }],
          // sdpSemantics: "unified-plan",
        },
      });
      AppStore.mrtc_connected = true;
      this.forceUpdate();

      mrtc.onRemoteConnection.sub((c) => {
        console.debug("onRemoteConnection ", c);
        addUserMessage("Customer Connected");

        this.connection = c;

        this.connection.onData.sub((c, d: any) => {
          console.log("Peer message", d);
          switch (d.type) {
            default:
              //message
              addResponseMessage(d.message);
          }
        });

        this.connection.onWebcamShared.sub((c, m) => {
          console.info(`onWebcamShared`, m);
          // const video = document.getElementById("video") as HTMLMediaElement;
          // video.srcObject = m.stream;
        });
        this.connection.onScreenShared.sub((c, m) => {
          console.info(`onScreenShared`, m);
          video.srcObject = m.stream;

          const throttleMouseMove = throttle(
            200,
            true,
            (x: number, y: number) => {
              console.log(`${x} ${y}`);
              this.connection.shareData({ type: "mouse-move", x, y });
            }
          );
          video.addEventListener("mousemove", (e: any) =>
            throttleMouseMove(
              e.offsetX / e.currentTarget.offsetWidth,
              e.offsetY / e.currentTarget.offsetHeight
            )
          );
          video.addEventListener("mousedown", (e: any) =>
            this.connection.shareData({
              type: "mouse-click",
              x: e.offsetX / e.currentTarget.offsetWidth,
              y: e.offsetY / e.currentTarget.offsetHeight,
            })
          );
        });
      });

      mrtc.onServerDisconnected.sub((error) =>
        console.warn("onServerDisconnected", error)
      );
    } catch (error) {
      console.warn("error");
      AppStore.errorConnectingServer = error;
    }
  };

  private handleNewUserMessage = (message: string) => {
    this.connection!.shareData({ message });
  };

  private handleAskPhoneCallMessage = async () => {
    await this.connection.shareData({
      message: "Lets fix this together, calling you.",
    });
    await this.connection.shareAudio({});
  };

  private handleScreenShare = async () => {
    await this.connection.shareData({ type: "screen-share" });
    toggleWidget();
    AppStore.showWidget = false;
  };

  private handleShowWidget = () => {
    AppStore.showWidget = !AppStore.showWidget;
    toggleWidget();
  };

  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <XSnackbar />
        <SetupDialog />
        {AppStore.mrtc_connected && (
          <>
            <Draggable handle="strong">
              <div className={classes.toolbar}>
                <ToggleButtonGroup
                  orientation="vertical"
                  value={AppStore.communicationValues}
                  exclusive
                >
                  <ToggleButton
                    value="chat"
                    onClick={() => console.log("clicked")}
                  >
                    <strong>TD</strong>
                  </ToggleButton>
                  <ToggleButton value="chat" onClick={this.handleShowWidget}>
                    <ChatIcon color="primary" />
                  </ToggleButton>
                  <ToggleButton
                    value="call"
                    onClick={this.handleAskPhoneCallMessage}
                  >
                    <PhoneIcon color="primary" />
                  </ToggleButton>
                  <ToggleButton value="screen" onClick={this.handleScreenShare}>
                    <ScreenShareIcon color="primary" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Draggable>
          </>
        )}

        {AppStore.showWidget && (
          <>
            <Widget
              title=""
              subtitle=""
              showCloseButton={false}
              profileAvatar={AppStore.agentAvatarUrl}
              handleNewUserMessage={this.handleNewUserMessage}
              launcher={() => <></>}
            />
          </>
        )}
        <video id="video" autoPlay={true} className={classes.video}></video>
      </div>
    );
  }
}

export default withStyles(styles)(App);
