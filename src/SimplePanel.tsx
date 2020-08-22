import React, { PureComponent } from "react";
import { PanelProps } from "@grafana/data";
import { SimpleOptions } from "types";
import Board from "react-trello";
import { getGrafanaLiveSrv } from "@grafana/runtime";
import { Unsubscribable } from "rxjs";

interface Props extends PanelProps<SimpleOptions> {}

import { sampleData } from "./samples";

interface State {
  channel?: string;
  boardData: any; //
  loaded: number;
}

export class NotesPanel extends PureComponent<Props, State> {
  state = {
    loaded: 0
  } as State;

  subscription?: Unsubscribable;

  //-------------------------------------------
  // Mounting behavior
  //-------------------------------------------

  componentDidMount = () => {
    console.log("MOUNT!");
    this.updateSubscription();
  };

  componentWillUnmount = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  };

  componentDidUpdate = (oldProps: Props) => {
    const channel = this.props.options?.source?.channel;
    if (oldProps.options?.source?.channel !== channel) {
      console.log("Channel changed!");
      this.updateSubscription();
    }
  };

  updateSubscription = () => {
    const srv = getGrafanaLiveSrv();
    if (!srv) {
      console.error('Grafana live not running, enable "live" feature toggle');
      return;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    const channel = this.props.options?.source?.channel;
    if (!channel) {
      return;
    }

    this.subscription = srv.getChannelStream(channel).subscribe({
      next: (msg: any) => {
        console.log("Got data!");
        this.setState({
          channel,
          boardData: msg,
          loaded: Date.now()
        });
      }
    });

    // Fill the channel with sample data first
    this.updateBoard(sampleData);
  };

  updateBoard = (newData: unknown) => {
    if (!newData) {
      return;
    }

    const channel = this.props.options?.source?.channel;
    if (!channel) {
      return;
    }

    // Send data the the channel
    getGrafanaLiveSrv().publish(channel, newData);
  };

  //-------------------------------------------
  //-------------------------------------------

  // onDataChange = (newData: unknown) => {
  //   console.log("onDataChange!", newData);
  // };

  onCardClick = (card: any) => {
    console.log("onCardClick", card);
  };

  //-------------------------------------------
  // Render
  //-------------------------------------------

  render() {
    const { boardData, channel } = this.state;
    if (!boardData) {
      if (!channel) {
        return <div>No channel defined yet...</div>;
      }
      return <div>loading....</div>;
    }

    const { width, height, options } = this.props;
    const { board } = options;

    const czz = {
      height: `${height}px`,
      width: `${width}px`,
      overflow: "auto",
      backgroundColor: "transparent",
      padding: "0px",
      margin: "0px"
    };

    return (
      <div>
        <Board
          style={czz}
          {...board} // standard properties for the board
          draggable={true}
          data={boardData}
          onDataChange={this.updateBoard}
          onCardClick={this.onCardClick}
        />
      </div>
    );
  }
}
