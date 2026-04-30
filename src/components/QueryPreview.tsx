import { useState, useEffect, useRef } from 'react'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useGraphStore } from '@/store/graphStore'
import { compileGraph } from '@/compiler'
import { useSchema } from '@/hooks/useSchema'
import { FIELDS } from '@/types/fields'
import { cn } from '@/lib/utils'

type Tab = 'sql' | 'rest' | 'results'

const PAGE_SIZE = 20
const MIN_WIDTH = 260
const MAX_WIDTH = 800

interface QueryResult {
  rows: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
}

async function postQuery(where: string, page: number): Promise<QueryResult> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ where, page, pageSize: PAGE_SIZE }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Query failed')
  }
  return res.json()
}

export function QueryPreview() {
  const { data: schemaFields } = useSchema()
  const fields = schemaFields ?? FIELDS

  const result = useStoreWithEqualityFn(
    useGraphStore,
    (s) => compileGraph(s.nodes, s.edges, fields),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  )

  const [tab, setTab] = useState<Tab>('sql')
  const [activeWhere, setActiveWhere] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [width, setWidth] = useState(320)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const { data: queryResult, isFetching, error: queryError } = useQuery({
    queryKey: ['query', activeWhere, page],
    queryFn: () => postQuery(activeWhere!, page),
    enabled: activeWhere !== null,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const delta = startX.current - e.clientX
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)))
    }
    const onMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const onResizeStart = (e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    e.preventDefault()
  }

  const whereClause = result.sql?.replace(/^WHERE\s+/, '') ?? ''
  const canRun = result.sql !== null && result.errors.length === 0
  const hasOutput = result.sql !== null || result.errors.length > 0
  const totalPages = queryResult ? Math.ceil(queryResult.total / PAGE_SIZE) : 0

  const handleRunQuery = () => {
    setPage(1)
    setActiveWhere(whereClause)
    setTab('results')
  }

  return (
    <aside
      className="flex-none flex flex-row border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="w-1 flex-none cursor-col-resize hover:bg-violet-400 dark:hover:bg-violet-600 transition-colors group relative"
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Panel content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 h-12 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Query Preview
          </span>
          {result.errors.length === 0 && result.sql && (
            <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">● valid</span>
          )}
          {result.errors.length > 0 && (
            <span className="ml-auto text-[10px] text-red-500 font-medium">● incomplete</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['sql', 'rest', 'results'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
                tab === t
                  ? 'text-violet-600 border-b-2 border-violet-500 -mb-px dark:text-violet-400'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
              )}
            >
              {t === 'sql' ? 'SQL' : t === 'rest' ? 'REST' : 'Results'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {tab !== 'results' && !hasOutput && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 italic leading-relaxed">
              Connect nodes to the Root to see the compiled query here.
            </p>
          )}

          {tab !== 'results' && result.errors.length > 0 && (
            <div className="space-y-1.5">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-500 dark:text-red-400 leading-snug">
                  ⚠ {e}
                </p>
              ))}
            </div>
          )}

          {tab === 'sql' && result.sql && (
            <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap break-words leading-relaxed">
              {result.sql}
            </pre>
          )}

          {tab === 'rest' && result.rest != null && (
            <pre className="text-xs font-mono text-sky-700 dark:text-sky-300 whitespace-pre-wrap break-words leading-relaxed">
              {JSON.stringify(result.rest, null, 2)}
            </pre>
          )}

          {tab === 'results' && (
            <>
              {queryError && (
                <p className="text-xs text-red-500 dark:text-red-400 leading-snug">
                  ⚠ {(queryError as Error).message}
                </p>
              )}
              {queryResult && (
                <>
                  <p className={cn(
                    'text-[10px] text-zinc-400 dark:text-zinc-500 transition-opacity',
                    isFetching && 'opacity-50',
                  )}>
                    {queryResult.total === 0
                      ? 'No rows matched'
                      : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, queryResult.total)} of ${queryResult.total} rows`}
                  </p>
                  <div className="overflow-x-auto">
                    <table className={cn('text-xs w-full border-collapse transition-opacity', isFetching && 'opacity-50')}>
                      <thead>
                        <tr>
                          {Object.keys(queryResult.rows[0] ?? {}).map((col) => (
                            <th
                              key={col}
                              className="text-left px-2 py-1.5 font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, i) => (
                          <tr
                            key={i}
                            className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          >
                            {Object.values(row).map((val, j) => (
                              <td
                                key={j}
                                className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                              >
                                {String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {!queryResult && !isFetching && !queryError && (
                <p className="text-xs text-zinc-400 dark:text-zinc-600 italic leading-relaxed">
                  Build a valid query and click Run Query to see results.
                </p>
              )}
            </>
          )}
        </div>

        {/* Pagination (results tab only) */}
        {tab === 'results' && queryResult && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs px-2 py-1 rounded text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← Prev
            </button>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs px-2 py-1 rounded text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Next →
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
          <button
            disabled={!canRun || isFetching}
            onClick={handleRunQuery}
            className={cn(
              'w-full py-2 rounded-lg text-xs font-semibold transition-colors',
              canRun && !isFetching
                ? 'bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600',
            )}
          >
            {isFetching ? 'Running…' : 'Run Query'}
          </button>
        </div>
      </div>
    </aside>
  )
}
