import { PanelPlugin } from "@grafana/data";
import { SimpleOptions } from "./types";
import { NotesPanel } from "./SimplePanel";

export const plugin = new PanelPlugin<SimpleOptions>(
  NotesPanel
).setPanelOptions(builder => {
  return builder
    .addTextInput({
      category: ["source"],
      path: "source.channel",
      name: "Board channel",
      description: "the name of the channel to listen for changes",
      defaultValue: "trello/board"
    })
    .addBooleanSwitch({
      category: ["board"],
      path: "board.cardDraggable",
      name: "Draggable Cards",
      defaultValue: true
    })
    .addBooleanSwitch({
      category: ["board"],
      path: "board.laneDraggable",
      name: "Draggable Lanes",
      defaultValue: true
    })
    .addBooleanSwitch({
      category: ["board"],
      path: "board.collapsibleLanes",
      name: "Collapsible Lanes",
      defaultValue: false
    })
    .addBooleanSwitch({
      category: ["board"],
      path: "board.editable",
      name: "Editable",
      description:
        "Makes the entire board editable. Allow cards to be added or deleted",
      defaultValue: false
    });
});
