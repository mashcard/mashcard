export const EDITOR_SELECTORS = {
  content: '.brickdoc > .ProseMirror',
  nodes: '.ProseMirror .react-renderer',
  blockAction: (index: number = 0) => `[data-testid=editor-block-action-button] >> nth=${index}`
}