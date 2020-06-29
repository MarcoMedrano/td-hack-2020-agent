import React from "react";
import { observer } from "mobx-react";
import AppStore from "./AppStore";
import { Snackbar } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

@observer
class XSnackbar extends React.Component {
  private handleClose() {
    AppStore.errorConnectingServer = "";
    AppStore.setupDialogOpened = true;
  }

  public render() {
    return (
      <Snackbar
        open={!!AppStore.errorConnectingServer}
        autoHideDuration={6000}
        onClose={this.handleClose}
      >
        <Alert onClose={this.handleClose} severity="warning">
          {`Cant connect: ${AppStore.errorConnectingServer}`}
        </Alert>
      </Snackbar>
    );
  }
}

export default XSnackbar;
