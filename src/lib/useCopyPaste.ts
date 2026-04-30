import { useEffect, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { useGraphStore } from '@/store/graphStore'

const PASTE_OFFSET = 30

export function useCopyPaste() {
  const { getNodes, getEdges } = useReactFlow()
  const pasteNodes = useGraphStore((s) => s.pasteNodes)
  const clipboard = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if (meta && e.key === 'c') {
        const selected = getNodes().filter((n) => n.selected && n.type !== 'root')
        if (selected.length === 0) return
        const selectedIds = new Set(selected.map((n) => n.id))
        const edges = getEdges().filter(
          (e) => selectedIds.has(e.source) && selectedIds.has(e.target),
        )
        clipboard.current = { nodes: selected, edges }
      }

      if (meta && e.key === 'v' && clipboard.current) {
        const { nodes, edges } = clipboard.current
        const stamp = Date.now()
        const idMap = new Map<string, string>()

        const newNodes: Node[] = nodes.map((n, i) => {
          const newId = `${n.type}-${stamp}-${i}`
          idMap.set(n.id, newId)
          return {
            ...n,
            id: newId,
            position: { x: n.position.x + PASTE_OFFSET, y: n.position.y + PASTE_OFFSET },
            selected: true,
          }
        })

        const newEdges: Edge[] = edges.map((e, i) => ({
          ...e,
          id: `e-${stamp}-${i}`,
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
        }))

        pasteNodes(newNodes, newEdges)
        // Shift clipboard so repeated pastes cascade instead of stacking
        clipboard.current = { nodes: newNodes, edges: newEdges }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [getNodes, getEdges, pasteNodes])
}
