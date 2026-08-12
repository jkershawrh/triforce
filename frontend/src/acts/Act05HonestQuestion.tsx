import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useDemoMetrics } from '../stores/demoStore'

interface Props { onComplete?: () => void }

const SAMPLE_TEXT = 'DISCHARGE SUMMARY: 72-year-old male with Type 2 Diabetes on Metformin 500mg and Lisinopril 10mg. Recent STEMI with PCI to RCA. Aspirin 81mg and Clopidogrel 75mg prescribed.'

interface GpuBenchmark {
  classification?: { latency_ms: number; cost_monthly: number }
  ner?: { latency_ms: number; cost_monthly: number }
  summarization?: { latency_ms: number; cost_monthly: number }
}

function fmt(ms: number): string {
  if (ms <= 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function Act05HonestQuestion({ onComplete }: Props) {
  const { pipeline, setPipeline } = useDemoMetrics()
  const [gpu, setGpu] = useState<GpuBenchmark>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pipeline && gpu.classification) return

    setLoading(true)
    const fetches: Promise<void>[] = []

    if (!pipeline) {
      fetches.push(
        fetch('/healthcare/api/v1/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: SAMPLE_TEXT, skip_cache: true }),
        })
          .then(r => r.json())
          .then(data => {
            const log = data.inference_log || []
            setPipeline({
              classifyMs: log.find((e: any) => e.node === 'classify')?.latency_ms || 0,
              nerMs: log.find((e: any) => e.node === 'extract_entities')?.latency_ms || 0,
              interactionsMs: log.find((e: any) => e.node === 'check_interactions')?.latency_ms || 0,
              summarizeMs: log.find((e: any) => e.node === 'summarize')?.latency_ms || 0,
              totalMs: data.total_ms,
              entities: data.entities?.length || 0,
              interactions: data.drug_interactions?.length || 0,
              costMonthly: data.cost_monthly || 0,
            })
          })
          .catch(() => {})
      )
    }

    for (const task of ['classification', 'ner', 'summarization'] as const) {
      fetches.push(
        fetch('/healthcare/api/v1/benchmark/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task, text: SAMPLE_TEXT, models: ['granite-3-2-8b-instruct'] }),
        })
          .then(r => r.json())
          .then(data => {
            const r = data.results?.[0]
            if (r && !r.error) {
              setGpu(prev => ({ ...prev, [task]: { latency_ms: r.latency_ms, cost_monthly: r.cost_monthly || 0 } }))
            }
          })
          .catch(() => {})
      )
    }

    Promise.all(fetches).finally(() => setLoading(false))
  }, [])

  const p = pipeline || { classifyMs: 0, nerMs: 0, interactionsMs: 0, summarizeMs: 0, totalMs: 0, entities: 0, interactions: 0, costMonthly: 0 }
  const hasLive = pipeline !== null

  const metrics = [
    { label: 'Clinical Pipeline', value: '4 nodes · 3 models', detail: 'classify → NER → interactions → summarize', color: 'var(--intel-cyan)' },
    { label: 'Entities Extracted', value: hasLive ? String(p.entities) : '—', detail: hasLive ? 'from live pipeline run' : 'loading...', color: 'var(--rh-teal)' },
    { label: 'Drug Interactions', value: hasLive ? `${p.interactions} found` : '—', detail: 'curated FDA database via MCP', color: 'var(--rh-orange)' },
    { label: 'Fraud Scored', value: '2 transactions', detail: '1 blocked (CRITICAL), 1 approved (LOW)', color: 'var(--rh-red)' },
    { label: 'CPU $/mo @10K/day', value: hasLive ? (p.costMonthly === 0 ? '$0' : `$${p.costMonthly}`) : '—', detail: 'projected from live pipeline', color: 'var(--rh-green)' },
  ]

  const comparison = [
    {
      task: 'Classification',
      cpu: hasLive ? fmt(p.classifyMs) : '—',
      gpu: gpu.classification ? fmt(gpu.classification.latency_ms) : loading ? '...' : '—',
      routing: 'CPU — no quality diff',
    },
    {
      task: 'NER',
      cpu: hasLive ? fmt(p.nerMs) : '—',
      gpu: gpu.ner ? fmt(gpu.ner.latency_ms) : loading ? '...' : '—',
      routing: 'CPU — good enough for batch',
    },
    {
      task: 'Summarization',
      cpu: hasLive ? fmt(p.summarizeMs) : '—',
      gpu: gpu.summarization ? fmt(gpu.summarization.latency_ms) : loading ? '...' : '—',
      routing: gpu.summarization && hasLive && p.summarizeMs > 0
        ? `GPU — ${(p.summarizeMs / gpu.summarization.latency_ms).toFixed(1)}x faster`
        : 'GPU — faster, better output',
    },
    {
      task: 'Drug Interactions',
      cpu: hasLive ? fmt(p.interactionsMs) : '—',
      gpu: 'n/a',
      routing: 'MCP tool — no LLM needed',
    },
    {
      task: 'Full Pipeline',
      cpu: hasLive ? fmt(p.totalMs) : '—',
      gpu: gpu.classification && gpu.ner && gpu.summarization
        ? fmt(gpu.classification.latency_ms + gpu.ner.latency_ms + gpu.summarization.latency_ms)
        : loading ? '...' : '—',
      routing: 'Hybrid — CPU + GPU combined',
    },
  ]

  const gpuMonthlyCost = [gpu.classification, gpu.ner, gpu.summarization]
    .filter(Boolean)
    .reduce((sum, g) => sum + (g?.cost_monthly || 0), 0)

  return (
    <div className="demo-section">
      <h3><span className="section-num">06</span> The Punchline</h3>
      <div className="section-context">
        You just ran real AI workloads. You benchmarked CPU vs GPU. You saw the efficiency stack.
        Here's the honest answer.
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What you just saw</div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="card"
            style={{ borderLeft: `3px solid ${m.color}`, padding: '12px 16px' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{m.detail}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        The routing decision — CPU vs GPU per task
      </motion.div>

      <motion.table
        style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 16px', fontSize: 13 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-dim)', fontWeight: 500 }}>Task</th>
            <th style={{ textAlign: 'right', padding: '10px 16px', color: 'var(--intel-cyan)', fontWeight: 600 }}>CPU</th>
            <th style={{ textAlign: 'right', padding: '10px 16px', color: 'var(--gpu-amber)', fontWeight: 600 }}>Gaudi</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-dim)', fontWeight: 500 }}>Routing Decision</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((row, i) => (
            <motion.tr
              key={row.task}
              style={{ borderBottom: '1px solid var(--border)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
            >
              <td style={{ padding: '10px 16px' }}>{row.task}</td>
              <td className="mono" style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--intel-cyan)', fontWeight: 700 }}>{row.cpu}</td>
              <td className="mono" style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--gpu-amber)', fontWeight: 600 }}>{row.gpu}</td>
              <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-dim)' }}>{row.routing}</td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      {gpuMonthlyCost > 0 && (
        <motion.div
          style={{ textAlign: 'center', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Monthly cost @10K/day: CPU = <strong style={{ color: 'var(--rh-green)' }}>$0</strong> · GPU = <strong style={{ color: 'var(--gpu-amber)' }}>${Math.round(gpuMonthlyCost)}</strong>
        </motion.div>
      )}

      <motion.div
        className="card"
        style={{ background: 'var(--surface-2)', borderLeft: '3px solid var(--intel-cyan)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
          {hasLive ? (
            <>
              This pipeline ran at <strong style={{ color: 'var(--intel-cyan)' }}>{fmt(p.totalMs)}</strong> on Intel Xeon 6 CPU.{' '}
              <strong style={{ color: 'var(--rh-green)' }}>Cost: {p.costMonthly === 0 ? '$0/mo' : `$${p.costMonthly}/mo`} @10K/day.</strong><br /><br />
            </>
          ) : null}
          <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>
            The question isn't "CPU or GPU." It's: which tasks need which hardware?
            Classification and NER run fine on CPU at $0. Summarization and reasoning benefit from GPU.
            The semantic router makes that decision in {'<'}1ms per request.
          </span><br /><br />
          <strong style={{ color: 'var(--rh-green)', fontSize: 16 }}>
            Most inference tasks ran within SLA on CPU at $0/token. GPU pays for itself where quality or speed demands it. The system decides for you.
          </strong>
        </p>
      </motion.div>

      {onComplete && (
        <motion.div
          style={{ textAlign: 'center', marginTop: 32 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button className="btn btn-primary" onClick={onComplete}>
            What's next →
          </button>
        </motion.div>
      )}
    </div>
  )
}
