import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

import styles from "./index.module.css";

export default function TreeViewPlugin() {
  const [editor] = useLexicalComposerContext();

  return (
    <TreeView
      viewClassName={styles["tree-view-output"]}
      treeTypeButtonClassName={styles["debug-treetype-button"]}
      timeTravelPanelClassName={styles["debug-timetravel-panel"]}
      timeTravelButtonClassName={styles["debug-timetravel-button"]}
      timeTravelPanelSliderClassName={styles["debug-timetravel-panel-slider"]}
      timeTravelPanelButtonClassName={styles["debug-timetravel-panel-button"]}
      editor={editor}
    />
  );
}
