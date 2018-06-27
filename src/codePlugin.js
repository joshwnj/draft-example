import {Editor, EditorState, RichUtils, Modifier, SelectionState} from 'draft-js';

const codePlugin = {
  handleBeforeInput (ch, editorState, { setEditorState }) {
    const selection = editorState.getSelection()
    const key = selection.getStartKey()
    const text = editorState.getCurrentContent().getBlockForKey(key).getText()
    const focusOffset = selection.getFocusOffset()
    const line = text.slice(0, focusOffset) + ch + text.slice(focusOffset)

    let nextEditorState = editorState
    const codeRe = /`([^`]+)`/g
    const matches = codeRe.exec(line)
console.log(line)
    if (matches) {
      console.log('CODE', matches)

      const { index } = matches
      const currentContent = editorState.getCurrentContent()
      const blockMap = currentContent.getBlockMap()
      const block = blockMap.get(key)
      const style = block.getInlineStyleAt(index).merge()
      const nextStyle = style.merge([ 'CODE' ])

      const focusOffset = index + matches[0].length
      const wordSelection = SelectionState.createEmpty(key).merge({
        anchorOffset: index,
        focusOffset
      })

      // let nextContentState = Modifier.applyInlineStyle(
      //   currentContent,
      //   wordSelection,
      //   nextStyle
      // )

      let nextContentState = Modifier.replaceText(
        currentContent,
        wordSelection,
        matches[0],
        nextStyle
      )

      nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
      )

      nextEditorState = EditorState.forceSelection(
        nextEditorState,
        nextContentState.getSelectionAfter()
      )
    }

    if (editorState === nextEditorState) { return 'not-handled' }
    
    setEditorState(nextEditorState)
    return 'handled'
  }
}

export default codePlugin
