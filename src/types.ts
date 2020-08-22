export interface BoardSource {
  channel: string; // live channel
}

export interface BoardConfig {
  /**
   * Set to false to disable lane dragging. Default: true
   */
  laneDraggable?: boolean;
  /**
   * Set to false to disable card dragging. Default: true
   */
  cardDraggable?: boolean;
  /**
   * Make the lanes with cards collapsible. Default: false
   */
  collapsibleLanes?: boolean;
  /**
   * Makes the entire board editable. Allow cards to be added or deleted Default: false
   */
  editable?: boolean;
}

export interface SimpleOptions {
  source: BoardSource;
  board: BoardConfig;
}
