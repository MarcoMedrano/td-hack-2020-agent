import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { observer } from "mobx-react";
import AppStore from "./AppStore";

@observer
class SetupDialog extends React.Component {
  private handleCloseDialog() {
    AppStore.setupDialogOpened = false;
    AppStore.connectMrtc!();
  }

  public render() {
    return (
      <Dialog
        open={AppStore.setupDialogOpened}
        onClose={this.handleCloseDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Agent Setup</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Agent Name"
            value={AppStore.agentName}
            onChange={(e) => {
              AppStore.agentName = e.target.value;
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="photo"
            label="Agent avatar url"
            fullWidth
            value={AppStore.agentAvatarUrl}
            onChange={(e) => {
              AppStore.agentAvatarUrl = e.target.value;
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCloseDialog} color="primary">
            CONNECT
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default SetupDialog;
