import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { MrtcFactory, IConnection, Logger } from "mark-ind-mrtc";
import { throttle } from "throttle-debounce";

import {
  makeStyles,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from "@material-ui/core";

Logger.configure({ level: "debug" });

const styles = ({ spacing, palette }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      textAlignLast: "center",
      padding: spacing(1),
    },
  });

const video = document.getElementById("video") as HTMLMediaElement;

interface AppProps extends WithStyles<typeof styles> {}

const initialState = {
  agentName: "Smith",
  messages: "",
  mrtc_connected: false,
};
type AppState = typeof initialState;

class App extends React.Component<AppProps, AppState> {
  private connection!: IConnection;

  constructor(props: any) {
    super(props);
    this.state = initialState;
  }

  private handleMessage = () => {
    this.connection.shareData({
      message: "May I call you so we fix this issue together",
    });
  };

  private handleClick = () => {
    this.connection.shareData({ type: "mouse-click", x: 100, y: 100 });
  };

  private handlePhoneCall = async () => {
    const mediaConnection = await this.connection.shareAudio({});
    const audio = document.getElementById("audio") as HTMLMediaElement;
    audio.srcObject = mediaConnection.stream;
  };

  private handleScreenShare = () => {
    this.connection.shareData({ type: "screen-share" });
  };

  private handleConnectMrtc = async () => {
    const mrtc = MrtcFactory.build();
    await mrtc.connectServer(`td-agent-${this.state.agentName}`, {
      host: "localhost",
      port: 9000,
      path: "/myapp",
    });
    this.setState({ mrtc_connected: true });

    mrtc.onRemoteConnection.sub((c) => {
      console.debug("onRemoteConnection ", c);
      this.setState({ messages: `Customer Connected\n${this.state.messages}` });

      this.connection = c;

      this.connection.onData.sub((c, d: any) => {
        console.log("Peer message", d);
        switch (d.type) {
          default:
            //message
            this.setState({ messages: `${d.message}\n${this.state.messages}` });
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
        video.addEventListener("mousemove", (e) =>
          throttleMouseMove(e.offsetX, e.offsetY)
        );
        video.addEventListener("mousedown", (e) =>
          this.connection.shareData({ type: "mouse-click", x: e.offsetX, y: e.offsetY })
        );
      });
    });

    mrtc.onServerDisconnected.sub((error) =>
      console.warn("onServerDisconnected", error)
    );
  };

  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <TextField
          autoFocus
          margin="dense"
          label="Agent name"
          value={this.state.agentName}
          disabled={this.state.mrtc_connected}
          onChange={(e) => {
            this.setState({ agentName: e.target.value });
          }}
        />
        {this.state.mrtc_connected ? (
          <>
            <Button onClick={this.handleMessage} color="primary">
              Text Message
            </Button>
            <Button onClick={this.handlePhoneCall} color="primary">
              Call
            </Button>
            <Button onClick={this.handleScreenShare} color="primary">
              Ask Screen Share
            </Button>
            <Button onClick={this.handleClick} color="primary">
              Send Click
            </Button>
          </>
        ) : (
          <Button onClick={this.handleConnectMrtc} color="primary">
            Connect
          </Button>
        )}
        <br />
        <br />
        {this.state.mrtc_connected && (
          <TextField
            label="Messages"
            multiline
            rows={2}
            value={this.state.messages}
            variant="outlined"
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(App);
