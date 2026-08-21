import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useModules } from '../stores/moduleStore'
import { MECHANISMS } from './efficiency/mechanisms'
import { VISUALS } from './efficiency/visuals'

interface Props { onComplete?: () => void }

const GROUP_HEADERS: Record<string, { label: string; detail: string }> = {
  'per-record': { label: 'Per-Record Efficiency', detail: 'Reduce work per record — do less inference, use the right model' },
  'model': { label: 'Model Optimization', detail: 'Same hardware, better models — four independent levers that compound' },
  'fleet': { label: 'Fleet-Scale Throughput', detail: 'Scale total output — replicas, disaggregated inference, batch streaming' },
  'learning': { label: 'Compounding Over Time', detail: 'These improve the longer they run — adaptive caching and multi-model consensus.' },
  'analysis': { label: 'Measure & Validate', detail: 'Every claim is testable. Run the benchmarks yourself.' },
}

const MODULE_ROUTES: Record<string, string> = {
  'semantic-routing': '/modules/semantic-routing',
  'conditional-pipeline': '/modules/conditional-pipeline',
  'mcp-tools': '/modules/mcp-tools',
  'model-optimization': '/modules/model-optimization',
  'batch-processing': '/modules/batch-processing',
  'replica-scaling': '/modules/replica-scaling',
  'llmd-inference': '/modules/llmd-inference',
  'adaptive-classification': '/modules/adaptive-cache',
  'speculative': '/modules/speculative',
  'heterogeneous': '/modules/heterogeneous',
  'fusion': '/modules/fusion',
  'benchmarking': '/modules/benchmarking',
}

export function Act04Efficiency({ onComplete }: Props) {
  const [searchParams] = useSearchParams()
  const initialRevealed = parseInt(searchParams.get('r') || '0', 10)
  const [revealed, setRevealed] = useState(initialRevealed)
  const { enabled, allModulesMode } = useModules()
  const navigate = useNavigate()
  const lastRevealedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialRevealed > 0 && lastRevealedRef.current) {
      setTimeout(() => {
        lastRevealedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [])

  const CORE_MODULES = new Set([
    'semantic-routing', 'conditional-pipeline', 'mcp-tools', 'model-optimization',
    'batch-processing', 'replica-scaling', 'llmd-inference', 'adaptive-classification',
  ])

  const activeMechanisms = MECHANISMS
  const isModuleEnabled = (moduleId: string) =>
    allModulesMode || CORE_MODULES.has(moduleId) || enabled.includes(moduleId)

  const advance = () => {
    if (revealed < activeMechanisms.length) {
      setRevealed(prev => prev + 1)
    }
  }

  const allRevealed = revealed >= activeMechanisms.length
  let lastGroup = ''

  return (
    <div className="demo-section">
      <h3><span className="section-num">05</span> The Efficiency Stack</h3>
      <div className="section-context">
        The scale test showed the tradeoff — latency climbs under load while cost stays flat.
        Here's how each layer pushes that efficiency line down. Three reduce work per record.
        Three scale throughput across the fleet.
      </div>

      {activeMechanisms.map((m, i) => {
        const Visual = VISUALS[m.visual]
        const showGroupHeader = m.group !== lastGroup && revealed >= i + 1
        lastGroup = revealed >= i + 1 ? m.group : lastGroup

        return (
          <div key={m.num} ref={i === revealed - 1 ? lastRevealedRef : undefined}>
            <AnimatePresence>
              {showGroupHeader && (
                <motion.div
                  style={{ marginTop: i > 0 ? 28 : 8, marginBottom: 8 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)' }}>
                    {GROUP_HEADERS[m.group]?.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-disabled)' }}>
                    {GROUP_HEADERS[m.group]?.detail}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {revealed >= i + 1 && (
                <motion.div
                  className="step-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ borderLeft: `3px solid ${m.color}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span className="step-num" style={{ background: m.color }}>{m.num}</span>
                    <div style={{ flex: 1 }}>
                      <strong>{m.title}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.owner}</div>
                    </div>
                    <div style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4,
                      background: m.status === 'live' ? 'var(--rh-green-dim)' : m.status === 'tested' ? 'var(--intel-cyan-dim)' : m.status === 'options' ? 'var(--rh-teal-dim)' : 'var(--surface-1)',
                      color: m.status === 'live' ? 'var(--rh-green)' : m.status === 'tested' ? 'var(--intel-cyan)' : m.status === 'options' ? 'var(--rh-teal)' : 'var(--text-disabled)',
                      fontWeight: 600,
                    }}>
                      {m.status === 'live' ? 'LIVE' : m.status === 'tested' ? 'TESTED' : m.status === 'options' ? 'OPTIONS' : 'ROADMAP'}
                    </div>
                  </div>

                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {m.what}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
                    {m.gain}
                  </div>

                  <Visual />

                  <motion.div
                    style={{
                      display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center',
                      flexWrap: 'wrap',
                    }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 12,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      color: 'var(--text-disabled)', textDecoration: 'line-through',
                    }}>
                      {m.before}
                    </div>
                    <div style={{ color: 'var(--rh-green)', fontSize: 16, alignSelf: 'center' }}>→</div>
                    <div style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 12,
                      background: 'var(--rh-green-dim)', border: '1px solid var(--rh-green)',
                      color: 'var(--rh-green)', fontWeight: 600,
                    }}>
                      {m.after}
                    </div>
                  </motion.div>

                  {MODULE_ROUTES[m.moduleId] && isModuleEnabled(m.moduleId) && (
                    <motion.div style={{ textAlign: 'center', marginTop: 12 }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <button className="btn btn-secondary"
                        style={{ fontSize: 11, padding: '4px 14px', borderColor: m.color }}
                        onClick={() => navigate(MODULE_ROUTES[m.moduleId] + `?from=5&r=${revealed}`)}>
                        Deep Dive →
                      </button>
                    </motion.div>
                  )}
                  {!isModuleEnabled(m.moduleId) && (
                    <motion.div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-disabled)' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      🔒 Available in other configurations
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {!allRevealed ? (
          <button className="btn btn-secondary" onClick={advance}>
            {revealed === 0
              ? 'Show the first layer →'
              : `Next: ${activeMechanisms[revealed]?.title} →`}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ fontSize: 13, color: 'var(--rh-green)', fontWeight: 600, marginBottom: 16 }}>
              {activeMechanisms.length} optimization layers. Each compounds. Cost stays at $0/token. Performance is engineered, not purchased.
            </div>
            <button className="btn btn-primary" onClick={onComplete}>
              The punchline →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
