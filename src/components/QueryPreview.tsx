import { useMemo, useState } from 'react'
import { useGraphStore } from '@/store/graphStore'
import { compileGraph } from '@/compiler'
import { cn } from '@/lib/utils'

type Tab = 'sql' | 'rest'

export function QueryPreview() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const [tab, setTab] = useState<Tab>('sql')

  // Recomputes only when nodes or edges change. Position-only changes (drags)
  // also trigger this, but the compile is O(n) and cheap at this scale.
  const result = useMemo(() => compileGraph(nodes, edges), [nodes, edges])

  const hasOutput = result.sql !== null || result.errors.length > 0

  return (
    <aside className="w-80 flex-none flex flex-col border-l border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 h-12 border-b border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Query Preview
        </span>
        {result.errors.length === 0 && result.sql && (
          <span className="ml-auto text-[10px] text-emerald-500 font-medium">● valid</span>
        )}
        {result.errors.length > 0 && (
          <span className="ml-auto text-[10px] text-red-500 font-medium">● incomplete</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {(['sql', 'rest'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
              tab === t
                ? 'text-violet-400 border-b-2 border-violet-500 -mb-px'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            {t === 'sql' ? 'SQL' : 'REST Filter'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {!hasOutput && (
          <p className="text-xs text-zinc-600 italic leading-relaxed">
            Connect nodes to the Root to see the compiled query here.
          </p>
        )}

        {result.errors.length > 0 && (
          <div className="space-y-1.5">
            {result.errors.map((e, i) => (
              <p key={i} className="text-xs text-red-400 leading-snug">
                ⚠ {e}
              </p>
            ))}
          </div>
        )}

        {tab === 'sql' && result.sql && (
          <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap break-words leading-relaxed">
            {result.sql}
          </pre>
        )}

        {tab === 'rest' && result.rest && (
          <pre className="text-xs font-mono text-sky-300 whitespace-pre-wrap break-words leading-relaxed">
            {JSON.stringify(result.rest, null, 2)}
          </pre>
        )}
      </div>
    </aside>
  )
}
