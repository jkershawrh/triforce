import { motion } from 'motion/react'

interface MetricCardProps {
  label: string
  value: string
  detail: string
  color: string
  index?: number
  delayStep?: number
  valueSize?: number
  centered?: boolean
}

export function MetricCard({ label, value, detail, color, index = 0, delayStep = 0.1, valueSize = 18, centered }: MetricCardProps) {
  return (
    <motion.div
      className="card"
      style={{ borderLeft: `3px solid ${color}`, padding: '12px 16px', textAlign: centered ? 'center' : undefined }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * delayStep }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: valueSize, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{detail}</div>
    </motion.div>
  )
}
