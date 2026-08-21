import { useState } from 'react'
import { motion } from 'motion/react'
import { useDemoMetrics } from '../../stores/demoStore'
import { fmt } from '../../utils/format'

export function RouterVisual() {
  const D = 0.6
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <motion.div style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 13 }}
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: D }}>
        <span style={{ color: 'var(--text-dim)' }}>Request:</span> <span className="mono" style={{ color: 'var(--text-secondary)' }}>"Classify this discharge summary"</span>
      </motion.div>

      <motion.div style={{ width: 2, height: 20 }}
        initial={{ scaleY: 0, background: 'var(--border)' }}
        animate={{ scaleY: 1, background: 'var(--rh-red)' }}
        transition={{ delay: D, duration: 0.4 }} />

      <motion.div style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--surface-2)', border: '2px solid var(--rh-red)', textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: D + 0.4, duration: D }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rh-red)' }}>vLLM Semantic Router</div>
        <motion.div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.8 }}>
          embedding classify · &lt;1ms
        </motion.div>
        <motion.div style={{ marginTop: 8, padding: '4px 16px', borderRadius: 6, background: 'var(--rh-green-dim)', border: '1px solid var(--rh-green)', display: 'inline-block' }}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: D + 1.2, type: 'spring', stiffness: 400, damping: 20 }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-green)' }}>→ SIMPLE</span>
        </motion.div>
      </motion.div>

      <motion.div style={{ width: 2, height: 20 }}
        initial={{ scaleY: 0, background: 'var(--border)' }}
        animate={{ scaleY: 1, background: 'var(--rh-green)' }}
        transition={{ delay: D + 1.6, duration: 0.3 }} />

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {[
          { tier: 'SIMPLE', model: 'granite-2b', color: 'var(--rh-green)', active: true },
          { tier: 'MEDIUM', model: 'qwen25-3b', color: 'var(--rh-blue)', active: false },
          { tier: 'COMPLEX', model: 'phi3-mini', color: 'var(--rh-purple)', active: false },
        ].map((r, i) => (
          <motion.div key={r.tier} style={{
            padding: '8px 16px', borderRadius: 8, background: 'var(--surface-2)',
            border: `2px solid ${r.active ? r.color : 'var(--border)'}`,
            textAlign: 'center', opacity: r.active ? 1 : 0.4,
            boxShadow: r.active ? `0 0 16px ${r.color}20` : 'none',
          }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: r.active ? 1 : 0.4, y: 0 }}
            transition={{ delay: D + 1.8 + i * 0.15, duration: 0.4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.tier}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{r.model}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function PipelineVisual() {
  const { pipeline } = useDemoMetrics()
  const p = pipeline
  const steps = [
    { name: 'Classify', time: p ? fmt(p.classifyMs) : '—', color: 'var(--rh-green)', skip: false },
    { name: 'Extract NER', time: p ? fmt(p.nerMs) : '—', color: 'var(--intel-cyan)', skip: false },
    { name: 'Check Interactions', time: 'conditional', color: 'var(--rh-orange)', skip: true },
    { name: 'Summarize', time: p ? fmt(p.summarizeMs) : '—', color: 'var(--rh-green)', skip: false },
  ]
  const D = 0.8
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center' }}>
          <motion.div style={{
            padding: '10px 14px', borderRadius: 10, textAlign: 'center', minWidth: 110,
            border: `2px solid var(--border)`, background: 'var(--surface-2)',
          }}
            initial={{ opacity: 0, scale: 0.9, borderColor: 'var(--border)' }}
            animate={{
              opacity: 1, scale: 1,
              borderColor: s.skip ? 'var(--rh-orange)' : s.color,
              background: s.skip ? 'var(--rh-orange-dim)' : 'var(--surface-2)',
            }}
            transition={{ delay: i * D, duration: 0.5 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.skip ? 'var(--rh-orange)' : 'var(--text-secondary)' }}>{s.name}</div>
            <motion.div className="mono" style={{ fontSize: 11, marginTop: 4 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * D + 0.4 }}>
              {s.skip ? (
                <span style={{ color: 'var(--rh-orange)', fontSize: 10 }}>skip if &lt;2 meds</span>
              ) : (
                <span style={{ color: 'var(--intel-cyan)', fontWeight: 700 }}>{s.time}</span>
              )}
            </motion.div>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div style={{ padding: '0 4px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * D + 0.5 }}>
              <svg width="28" height="12" viewBox="0 0 28 12">
                <motion.line x1="0" y1="6" x2="20" y2="6" stroke="var(--border)" strokeWidth="2"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * D + 0.5, duration: 0.3 }} />
                <polygon points="18,2 26,6 18,10" fill="var(--border)" />
              </svg>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

export function ToolsVisual() {
  const D = 0.7
  const { pipeline } = useDemoMetrics()
  const mcpTime = pipeline ? fmt(pipeline.interactionsMs) : '—'
  const llmTime = pipeline ? fmt(pipeline.nerMs) : '—'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <motion.div style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 12 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span style={{ color: 'var(--text-dim)' }}>Agent needs:</span> <span className="mono" style={{ color: 'var(--text-secondary)' }}>drug interaction data</span>
      </motion.div>

      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        <motion.div style={{ textAlign: 'center' }}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: D }}>
          <div style={{ padding: '12px 20px', borderRadius: 10, background: 'var(--surface-2)', border: '2px solid var(--rh-teal)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-teal)' }}>MCP Tool</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>FDA / NIH RxNav</div>
          </div>
          <motion.div className="mono" style={{ marginTop: 6 }}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: D + 0.5, type: 'spring', stiffness: 300 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--rh-green)' }}>{mcpTime}</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-dim)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.8 }}>
          vs
        </motion.div>

        <motion.div style={{ textAlign: 'center', opacity: 0.4 }}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 0.4, x: 0 }} transition={{ delay: D + 0.3 }}>
          <div style={{ padding: '12px 20px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', textDecoration: 'line-through' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-disabled)' }}>LLM Call</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-disabled)', marginTop: 4 }}>granite-2b-cpu</div>
          </div>
          <motion.div className="mono" style={{ marginTop: 6 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.6 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--rh-orange)' }}>{llmTime}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export function StreamsVisual() {
  const D = 0.5
  const topics = ['healthcare.requests', 'healthcare.results', 'finserv.requests']
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Records stream through AMQ Streams topics
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {topics.map((topic, i) => (
          <motion.div key={topic} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 400,
          }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * D, duration: 0.4 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--rh-orange)', minWidth: 160, textAlign: 'right' }}>{topic}</div>
            <div style={{ flex: 1, height: 6, background: 'var(--surface-1)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div style={{ height: '100%', borderRadius: 3, background: 'var(--rh-orange)' }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: i * D + 0.3, duration: 0.8 }} />
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: topics.length * D + 0.5 }}>
        Parallel consumers process records concurrently — throughput scales with consumer count
      </motion.div>
    </div>
  )
}

export function ReplicasVisual() {
  const D = 0.4
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[1, 2, 3].map(n => (
            <motion.div key={`agent-${n}`} style={{
              padding: '6px 14px', borderRadius: 6, background: 'var(--surface-2)',
              border: '1px solid var(--rh-blue)', fontSize: 11,
            }} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: n * D * 0.5, duration: 0.4 }}>
              <span style={{ color: 'var(--rh-blue)' }}>Agent Pod {n}</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D * 2 }}>
          <svg width="40" height="60" viewBox="0 0 40 60">
            {[10, 30, 50].map((y, i) => (
              <motion.line key={y} x1="0" y1={y} x2="32" y2="30" stroke="var(--rh-blue)" strokeWidth="1.5" strokeOpacity="0.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: D * 2 + i * 0.15, duration: 0.3 }} />
            ))}
            <polygon points="30,26 38,30 30,34" fill="var(--rh-blue)" opacity="0.5" />
          </svg>
        </motion.div>

        <motion.div style={{
          padding: '10px 16px', borderRadius: 8, background: 'var(--surface-2)',
          border: '2px solid var(--rh-red)', fontSize: 12,
        }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: D * 3, duration: 0.4 }}>
          <div style={{ fontWeight: 700, color: 'var(--rh-red)' }}>OCP Service</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>load balance</div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D * 4 }}>
          <svg width="40" height="60" viewBox="0 0 40 60">
            {[10, 30, 50].map((y, i) => (
              <motion.line key={y} x1="8" y1="30" x2="40" y2={y} stroke="var(--intel-cyan)" strokeWidth="1.5" strokeOpacity="0.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: D * 4 + i * 0.15, duration: 0.3 }} />
            ))}
            <polygon points="6,26 6,34 0,30" fill="var(--intel-cyan)" opacity="0.5" />
          </svg>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[1, 2, 3].map(n => (
            <motion.div key={`vllm-${n}`} style={{
              padding: '6px 14px', borderRadius: 6, background: 'var(--surface-2)',
              border: '1px solid var(--intel-cyan)', fontSize: 11,
            }} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: D * 4.5 + n * D * 0.5, duration: 0.4 }}>
              <span className="mono" style={{ color: 'var(--intel-cyan)' }}>vLLM granite-2b</span>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D * 7 }}>
        Agent replicas reduce latency · Model serving replicas unlock throughput
      </motion.div>
    </div>
  )
}

export function LlmdVisual() {
  const D = 0.6
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Target architecture: inference request arrives with SLO latency target
      </motion.div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.div style={{
          padding: '12px 20px', borderRadius: 10, background: 'var(--surface-2)',
          border: '2px solid var(--rh-purple)', textAlign: 'center',
        }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: D, duration: 0.5 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-purple)' }}>llm-d Planner</div>
          <motion.div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.4 }}>
            SLO-aware · capacity check
          </motion.div>
          <motion.div style={{
            marginTop: 6, padding: '2px 10px', borderRadius: 4,
            background: 'var(--rh-green-dim)', border: '1px solid var(--rh-green)', display: 'inline-block',
          }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: D + 0.8, type: 'spring', stiffness: 400, damping: 20 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--rh-green)' }}>route → node-3</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 1.2 }}>
          <svg width="50" height="50" viewBox="0 0 50 50">
            <motion.line x1="0" y1="25" x2="35" y2="12" stroke="var(--rh-purple)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: D + 1.2, duration: 0.4 }} />
            <motion.line x1="0" y1="25" x2="35" y2="38" stroke="var(--rh-purple)" strokeWidth="2" strokeDasharray="4 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: D + 1.4, duration: 0.4 }} />
          </svg>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <motion.div style={{
            padding: '10px 20px', borderRadius: 10, background: 'var(--surface-2)',
            border: '2px solid var(--rh-purple)', textAlign: 'center',
          }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: D + 1.6, duration: 0.5 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-purple)' }}>Prefill Node</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>compute-heavy · high-core</div>
            <motion.div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-disabled)', marginTop: 4 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 2.2 }}>
              TBD
            </motion.div>
          </motion.div>

          <motion.div style={{
            padding: '10px 20px', borderRadius: 10, background: 'var(--surface-2)',
            border: '2px solid var(--rh-purple)', textAlign: 'center',
          }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: D + 2.0, duration: 0.5 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-purple)' }}>Decode Node</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>memory-bound · stream</div>
            <motion.div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-disabled)', marginTop: 4 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 2.6 }}>
              TBD
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div style={{ marginTop: 12 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 3.0 }}>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-disabled)' }}>Planned — latency targets TBD</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>SLO-aware routing</span>
      </motion.div>
    </div>
  )
}

export function ModelOptVisual() {
  const [compareResult, setCompareResult] = useState<any>(null)
  const [comparing, setComparing] = useState(false)

  const runCompare = async () => {
    setComparing(true)
    try {
      const resp = await fetch('/healthcare/api/v1/pipeline/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'DISCHARGE SUMMARY: 72-year-old male with Type 2 Diabetes on Metformin and Lisinopril. Recent STEMI with PCI to RCA. Started on Aspirin 81mg, Clopidogrel 75mg.',
          classify_model: 'granite-2b-cpu',
          ner_model: 'granite-2b-int8',
          summarize_model: 'granite-2b-cpu',
        }),
      })
      setCompareResult(await resp.json())
    } catch {
      setCompareResult({ error: 'INT8 models not deployed yet — comparison will be available after optimization' })
    }
    setComparing(false)
  }

  const options = [
    { label: 'Quantization', detail: 'INT8 / INT4 precision', gain: '~1.5x faster', sub: 'AMX instructions', color: 'var(--intel-cyan)' },
    { label: 'Optimized Variants', detail: 'Models built for CPU', gain: 'AMX-aware kernels', sub: 'Same accuracy', color: 'var(--rh-green)' },
    { label: 'Model Selection', detail: 'Right-size to task', gain: 'Don\'t over-provision', sub: '2B vs 3B vs 3.8B', color: 'var(--rh-blue)' },
    { label: 'Prompt Tuning', detail: 'Shorter prompts', gain: 'Fewer tokens in/out', sub: '= faster inference', color: 'var(--rh-teal)' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {options.map((o, i) => (
          <motion.div
            key={o.label}
            style={{
              padding: '12px 16px', borderRadius: 8, background: 'var(--surface-2)',
              border: `1px solid ${o.color}`, textAlign: 'center', minWidth: 130, flex: '1 1 130px', maxWidth: 170,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: o.color }}>{o.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{o.detail}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{o.sub}</div>
            <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--rh-green)', marginTop: 6 }}>{o.gain}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="btn btn-secondary" onClick={runCompare} disabled={comparing}
          style={{ borderColor: 'var(--intel-cyan)' }}>
          {comparing ? 'Running INT4 vs INT8...' : 'Prove it — run INT4 vs INT8 comparison'}
        </button>
      </div>

      {compareResult && !compareResult.error && (
        <motion.div style={{ marginTop: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--text-dim)' }}>Step</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--text-dim)' }}>INT4 (baseline)</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--intel-cyan)' }}>INT8 (optimized)</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--rh-green)' }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {compareResult.baseline.inference_log.map((b: any, i: number) => {
                const o = compareResult.optimized.inference_log[i]
                const delta = o ? b.latency_ms - o.latency_ms : 0
                const pct = o && b.latency_ms > 0 ? Math.round((delta / b.latency_ms) * 100) : 0
                return (
                  <tr key={b.node} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 10px' }}>{b.node}</td>
                    <td className="mono" style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-dim)' }}>{b.latency_ms}ms</td>
                    <td className="mono" style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--intel-cyan)', fontWeight: 700 }}>{o ? `${o.latency_ms}ms` : '—'}</td>
                    <td className="mono" style={{ padding: '6px 10px', textAlign: 'right', color: delta > 0 ? 'var(--rh-green)' : 'var(--rh-orange)', fontWeight: 600 }}>{delta > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`}</td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td style={{ padding: '6px 10px', fontWeight: 700 }}>Total</td>
                <td className="mono" style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-dim)', fontWeight: 700 }}>{compareResult.baseline.total_ms}ms</td>
                <td className="mono" style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--intel-cyan)', fontWeight: 700 }}>{compareResult.optimized.total_ms}ms</td>
                <td className="mono" style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--rh-green)', fontWeight: 700 }}>{compareResult.speedup} faster</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 6 }}>
            Same document · same hardware · same $0/token · {compareResult.delta_ms}ms saved
          </div>
        </motion.div>
      )}

      {compareResult?.error && (
        <motion.div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-disabled)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {compareResult.error}
        </motion.div>
      )}
    </div>
  )
}

export function AdaptiveVisual() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const D = 0.5

  const fetchStats = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/healthcare/api/v1/adaptive/stats')
      setStats(await resp.json())
    } catch {
      setStats({ error: 'Adaptive classification endpoint not available' })
    }
    setLoading(false)
  }

  const phases = [
    { label: 'Day 1', llm: 100, cache: 0 },
    { label: 'Week 2', llm: 40, cache: 60 },
    { label: 'Month 1+', llm: 5, cache: 95 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
        {phases.map((p, i) => (
          <motion.div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: D + i * 0.5, duration: 0.4 }}>
            <div style={{ width: 60, fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textAlign: 'right' }}>{p.label}</div>
            <div style={{ flex: 1, height: 22, borderRadius: 4, overflow: 'hidden', display: 'flex', background: 'var(--surface-1)' }}>
              <motion.div style={{ height: '100%', background: 'var(--rh-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                initial={{ width: '100%' }} animate={{ width: `${p.llm}%` }}
                transition={{ delay: D + i * 0.5 + 0.3, duration: 0.6 }}>
                {p.llm > 15 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>LLM {p.llm}%</span>}
              </motion.div>
              {p.cache > 0 && (
                <motion.div style={{ height: '100%', background: 'var(--rh-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  initial={{ width: 0 }} animate={{ width: `${p.cache}%` }}
                  transition={{ delay: D + i * 0.5 + 0.3, duration: 0.6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>Cache {p.cache}%</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 4, lineHeight: 1.6 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 2.0 }}>
        Document → SHA-256 → Cache lookup<br/>
        <span style={{ color: 'var(--rh-green)', fontWeight: 600 }}>Hit → cached classification {'<'}1ms</span>
        {' · '}
        <span style={{ color: 'var(--rh-orange)', fontWeight: 600 }}>Miss → LLM → store result</span>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 2.5 }}>
        <button className="btn btn-secondary"
          style={{ borderColor: 'var(--rh-green)', fontSize: 12, padding: '6px 16px' }}
          onClick={fetchStats} disabled={loading}>
          {loading ? 'Checking…' : 'Prove it — show live cache stats'}
        </button>
      </motion.div>

      {stats && !stats.error && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 280 }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Cache size', stats.cache_size],
                ['Total lookups', stats.total_lookups],
                ['Cache hits', stats.cache_hits],
                ['Hit rate', `${(stats.hit_rate * 100).toFixed(1)}%`],
                ['LLM reduction', `${stats.llm_reduction_pct}%`],
              ].map(([label, val]) => (
                <tr key={String(label)}>
                  <td style={{ padding: '4px 8px', color: 'var(--text-dim)' }}>{label}</td>
                  <td className="mono" style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--rh-green)' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {stats?.error && (
        <motion.div style={{ fontSize: 12, color: 'var(--text-disabled)', textAlign: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {stats.error}
        </motion.div>
      )}
    </div>
  )
}

export function SpeculativeVisual() {
  const D = 0.5
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', textAlign: 'center' }}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: D }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--intel-blue)' }}>Draft Model</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>granite-4-0-h-tiny</div>
          <motion.div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-green)', marginTop: 4 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.5 }}>
            Proposes 5 tokens → 50ms
          </motion.div>
        </motion.div>
        <motion.div style={{ fontSize: 20, color: 'var(--text-dim)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.8 }}>→</motion.div>
        <motion.div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', textAlign: 'center' }}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: D + 1.0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--intel-cyan)' }}>Target Model</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>granite-2b-cpu</div>
          <motion.div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-green)', marginTop: 4 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 1.5 }}>
            Verifies all 5 → 800ms
          </motion.div>
        </motion.div>
      </div>
      <motion.div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 2.0 }}>
        4 correct, 1 rejected → regenerate 1 token<br/>
        <span className="mono" style={{ fontWeight: 700, color: 'var(--rh-green)' }}>Total: measured by the live speculative endpoint</span>
      </motion.div>
    </div>
  )
}

export function HeterogeneousVisual() {
  const D = 0.5
  const routes = [
    { label: 'Classify document', route: 'SIMPLE', hw: 'CPU', model: 'granite-2b', cost: '$0', color: 'var(--intel-cyan)' },
    { label: 'Extract entities', route: 'SIMPLE', hw: 'CPU', model: 'granite-2b', cost: '$0', color: 'var(--intel-cyan)' },
    { label: 'Summarize record', route: 'MEDIUM', hw: 'CPU', model: 'qwen25-3b', cost: '$0', color: 'var(--intel-cyan)' },
    { label: 'Differential diagnosis', route: 'COMPLEX', hw: 'Gaudi', model: 'gpt-oss-120b', cost: '$/tok', color: 'var(--gpu-amber)' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400, margin: '0 auto' }}>
      {routes.map((r, i) => (
        <motion.div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
          initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: D + i * 0.3 }}>
          <div style={{ width: 140, color: 'var(--text-dim)' }}>{r.label}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', width: 50 }}>{r.route}</div>
          <div style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: r.hw === 'Gaudi' ? 'var(--gpu-amber-dim)' : 'var(--intel-cyan-dim)', color: r.color }}>{r.hw}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{r.model}</div>
          <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: r.hw === 'Gaudi' ? 'var(--gpu-amber)' : 'var(--rh-green)' }}>{r.cost}</div>
        </motion.div>
      ))}
      <motion.div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 1.5 }}>
        3 of 4 tasks → CPU ($0) · 1 task → GPU ($/token)
      </motion.div>
    </div>
  )
}

export function FusionVisual() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const D = 0.5

  const fetchStats = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/healthcare/api/v1/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'compliance', prompt: 'Is a pattern of $9,500 transfers to Cayman Islands AML structuring?' }),
      })
      setStats(await resp.json())
    } catch {
      setStats({ error: 'Fusion endpoint not available' })
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {['granite-2b', 'qwen25-3b', 'phi3-mini'].map((m, i) => (
          <motion.div key={m} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 11, textAlign: 'center' }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: D + i * 0.2 }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{m}</div>
            <div style={{ color: 'var(--text-dim)', marginTop: 2 }}>answers</div>
          </motion.div>
        ))}
      </div>
      <motion.div style={{ fontSize: 16, color: 'var(--text-dim)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 0.8 }}>↓</motion.div>
      <motion.div style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--surface-2)', border: '2px solid var(--accent-blue)', fontSize: 12, textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: D + 1.0 }}>
        <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>Judge (granite-8b)</div>
        <div style={{ color: 'var(--text-dim)', marginTop: 2 }}>consensus · contradictions · gaps</div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 1.5 }}>
        <button className="btn btn-secondary" style={{ borderColor: 'var(--accent-blue)', fontSize: 12, padding: '6px 14px' }}
          onClick={fetchStats} disabled={loading}>
          {loading ? 'Running fusion...' : 'Prove it — run 3-model panel'}
        </button>
      </motion.div>

      {stats && !stats.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-dim)' }}>
          Panel: {stats.panel?.count} models in {stats.panel?.latency_ms}ms · Judge: {stats.judge?.latency_ms}ms · Total: {stats.total_ms}ms
        </motion.div>
      )}
      {stats?.error && (
        <div style={{ fontSize: 12, color: 'var(--text-disabled)' }}>{stats.error}</div>
      )}
    </div>
  )
}

export function BenchmarkVisual() {
  const D = 0.5
  const data = [
    { task: 'Classification', cpu: '650ms', gpu: '188ms', speedup: '3.5x', verdict: 'CPU fine for SLA >1s' },
    { task: 'NER', cpu: '7.5s', gpu: '2.0s', speedup: '3.7x', verdict: 'GPU if latency-critical' },
    { task: 'Summarization', cpu: '3.3s', gpu: '1.5s', speedup: '2.2x', verdict: 'GPU wins' },
    { task: 'Diagnosis', cpu: '14.8s', gpu: '1.5s', speedup: '10.1x', verdict: 'GPU essential' },
  ]
  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-dim)' }}>Task</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--intel-cyan)' }}>CPU</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--gpu-amber)' }}>GPU</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--rh-green)' }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <motion.tr key={d.task}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: D + i * 0.2 }}
              style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 8px', fontWeight: 600 }}>{d.task}</td>
              <td className="mono" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--intel-cyan)' }}>{d.cpu}</td>
              <td className="mono" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--gpu-amber)' }}>{d.gpu}</td>
              <td className="mono" style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--rh-green)' }}>{d.speedup}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <motion.div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: D + 1.2 }}>
        MAAS reproducible medians · July 8 2026
      </motion.div>
    </div>
  )
}

export const VISUALS: Record<string, () => React.ReactElement> = {
  router: RouterVisual,
  modelopt: ModelOptVisual,
  pipeline: PipelineVisual,
  tools: ToolsVisual,
  streams: StreamsVisual,
  replicas: ReplicasVisual,
  llmd: LlmdVisual,
  adaptive: AdaptiveVisual,
  speculative: SpeculativeVisual,
  heterogeneous: HeterogeneousVisual,
  fusion: FusionVisual,
  benchmark: BenchmarkVisual,
}
