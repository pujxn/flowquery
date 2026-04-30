import { Panel, useReactFlow } from '@xyflow/react'
import { useGraphStore, type NodeKind } from '@/store/graphStore'

interface PaletteEntry {
  kind: NodeKind
  label: string
  colorClass: string
}

const PALETTE: PaletteEntry[] = [
  { kind: 'field',    label: 'Field',    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-800' },
  { kind: 'operator', label: 'Operator', colorClass: 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800' },
  { kind: 'value',    label: 'Value',    colorClass: 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100 dark:bg-sky-900 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-800' },
  { kind: 'logic',    label: 'Logic',    colorClass: 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-900 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-800' },
]

export function NodePalette() {
  const addNode = useGraphStore((s) => s.addNode)
  const { screenToFlowPosition } = useReactFlow()

  function handleAdd(kind: NodeKind) {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    addNode(kind, {
      x: center.x + (Math.random() - 0.5) * 60,
      y: center.y + (Math.random() - 0.5) * 60,
    })
  }

  return (
    <Panel position="top-left">
      <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col gap-2 shadow-xl dark:bg-zinc-900 dark:border-zinc-700">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
          Add Node
        </p>
        {PALETTE.map(({ kind, label, colorClass }) => (
          <button
            key={kind}
            onClick={() => handleAdd(kind)}
            className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${colorClass}`}
          >
            {label}
          </button>
        ))}
      </div>
    </Panel>
  )
}
