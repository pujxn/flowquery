import './App.css'
import { FlowCanvas } from './FlowCanvas'

function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex-none flex items-center gap-3 px-5 h-12 border-b border-zinc-800 bg-zinc-900">
        <span className="font-bold text-violet-400 text-base tracking-tight">
          FlowQuery
        </span>
        <span className="text-xs text-zinc-500 mt-0.5">
          visual query builder
        </span>
      </header>

      {/* Canvas */}
      <main className="flex-1 overflow-hidden">
        <FlowCanvas />
      </main>
    </div>
  )
}

export default App
