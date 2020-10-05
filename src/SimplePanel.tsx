import React, { PureComponent } from "react";
import { isLiveChannelMessageEvent, isLiveChannelStatusEvent, LiveChannelConnectionState, LiveChannelScope, LiveChannelStatusEvent, PanelProps } from "@grafana/data";
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
  status?: LiveChannelStatusEvent;
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

  getLiveChannel = () => {
    const live = getGrafanaLiveSrv();
    if (!live) {
      console.error('Grafana live not running, enable "live" feature toggle');
      return undefined;
    }

    const channel = this.props.options?.source?.channel;
    if (!channel) {
      return undefined;
    }

    return live.getChannel({
      scope: LiveChannelScope.Grafana,
      namespace: "broadcast", // holds on to the last value
      path: `ryantxu/board/${channel}`
    });
  };

  updateSubscription = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    const c = this.getLiveChannel();
    if (c) {
      const channel = this.props.options?.source?.channel;

      this.subscription = c.getStream().subscribe({
        next: (msg) => {
          console.log("Got msg", msg);
          if(isLiveChannelMessageEvent(msg)) {
            this.setState({
              channel,
              boardData: msg.message,
              loaded: Date.now()
            });
          }
          else if(isLiveChannelStatusEvent(msg)) {
            this.setState({
              status: msg
            });

            if(msg.state === LiveChannelConnectionState.Connected) {
              if(!this.state.boardData) {
                this.updateBoard(sampleData);
              }
            }
          }
        }
      });
    }
  };

  updateBoard = (newData: unknown) => {
    if (!newData) {
      return;
    }

    const channel = this.getLiveChannel();
    if (!channel) {
      return;
    }
  //  debugger;

    // Send data the the channel
    channel.publish!(newData);
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
    const { boardData, status } = this.state;
    if (!status || !boardData) {
      return <div>Loading...</div>
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
