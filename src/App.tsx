import './App.css'
import { Sun, Moon } from 'lucide-react'
import { FlowCanvas } from './FlowCanvas'
import { QueryPreview } from './components/QueryPreview'
import { useTheme } from '@/lib/useTheme'

function App() {
  const { dark, toggle } = useTheme()

  return (
    <div className="w-screen h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex-none flex items-center gap-3 px-5 h-12 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="font-bold text-violet-600 dark:text-violet-400 text-base tracking-tight">
          FlowQuery
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          visual query builder
        </span>
        <button
          onClick={toggle}
          className="ml-auto p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <FlowCanvas dark={dark} />
        <QueryPreview />
      </main>
    </div>
  )
}

export default App
