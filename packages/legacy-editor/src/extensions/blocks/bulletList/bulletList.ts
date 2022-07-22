import { BulletList as TiptapBulletList } from '@tiptap/extension-bullet-list'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { ListView } from '../../../components/blockViews'
import { meta } from './meta'

export const BulletList = TiptapBulletList.extend({
  name: meta.name,
  draggable: true,
  addNodeView() {
    return LegacyReactNodeViewRenderer(ListView)
  }
})
