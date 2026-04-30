import { Panel, useReactFlow } from '@xyflow/react'
import { useGraphStore, type NodeKind } from '@/store/graphStore'

interface PaletteEntry {
  kind: NodeKind
  label: string
  colorClass: string
}

const PALETTE: PaletteEntry[] = [
  { kind: 'field',    label: 'Field',    colorClass: 'bg-emerald-900 border-emerald-700 text-emerald-200 hover:bg-emerald-800' },
  { kind: 'operator', label: 'Operator', colorClass: 'bg-amber-900   border-amber-700   text-amber-200   hover:bg-amber-800'   },
  { kind: 'value',    label: 'Value',    colorClass: 'bg-sky-900      border-sky-700      text-sky-200      hover:bg-sky-800'      },
  { kind: 'logic',    label: 'Logic',    colorClass: 'bg-rose-900     border-rose-700     text-rose-200     hover:bg-rose-800'     },
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
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex flex-col gap-2 shadow-xl">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
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
