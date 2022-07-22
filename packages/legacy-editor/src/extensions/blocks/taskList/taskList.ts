import { TaskList as TiptapTaskList } from '@tiptap/extension-task-list'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { ListView } from '../../../components/blockViews'
import { meta } from './meta'

export const TaskList = TiptapTaskList.extend({
  name: meta.name,
  draggable: true,
  addNodeView() {
    return LegacyReactNodeViewRenderer(ListView)
  }
})
