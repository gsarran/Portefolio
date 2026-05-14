import { useState, useEffect, useCallback } from 'react'
import WorkflowCanvas from './WorkflowCanvas.jsx'

export default function WorkflowModal({ item, onClose }) {
  // runKey: increments on "Relancer" to force a clean WorkflowCanvas remount
  const [runKey,   setRunKey]   = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // modeOverride: null = use item default, 'ok'/'ko' = user selection
  const [modeOverride, setModeOverride] = useState(null)
  const mode = modeOverride ?? (item?.layout === 'router' ? 'ok' : 'default')

  // Reset everything when the opened item changes
  useEffect(() => {
    setModeOverride(null)
    setRunKey(0)
    setIsPaused(false)
  }, [item?.id])

  // Escape key
  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleModeChange = useCallback(m => {
    setIsPaused(false)
    setModeOverride(m)
    // key changes → WorkflowCanvas remounts → single fresh animation
  }, [])

  const handleRelancer = useCallback(() => {
    setIsPaused(false)
    setRunKey(k => k + 1)
    // key changes → WorkflowCanvas remounts → single fresh animation
  }, [])

  if (!item) return null

  const family   = item.type === 'Airtable' ? 'airtable' : 'make'
  const isRouter = item.layout === 'router'

  // Unique key per (item × mode × run) — guarantees one clean mount per animation
  const canvasKey = `${item.id}-${mode}-${runKey}`

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-shell">

        <header className="modal-top">
          <div className="modal-meta">
            <div className="modal-kicker" style={{ color: `var(--${family})` }}>
              {item.type === 'Airtable' ? 'Workflow Airtable' : 'Workflow Make'}
            </div>
            <div className="modal-title">{item.title}</div>
            <div className="modal-desc">{item.desc}</div>
          </div>

          <div className="modal-actions">
            {isRouter ? (
              <>
                <button
                  className={`btn btn-neutral${mode === 'ok' ? ' active make' : ''}`}
                  onClick={() => handleModeChange('ok')}
                >
                  {item.branches.ok.label}
                </button>
                <button
                  className={`btn btn-neutral warning${mode === 'ko' ? ' active warning' : ''}`}
                  onClick={() => handleModeChange('ko')}
                >
                  {item.branches.ko.label}
                </button>
              </>
            ) : (
              <button
                className={`btn btn-neutral active ${family}`}
                onClick={handleRelancer}
              >
                ↺ Relancer
              </button>
            )}
            <button
              className={`btn btn-neutral${isPaused ? ` active ${family}` : ''}`}
              onClick={() => setIsPaused(p => !p)}
            >
              {isPaused ? '▶ Reprendre' : '⏸ Pause'}
            </button>
          </div>

          <button className="modal-close" aria-label="Fermer" onClick={onClose}>×</button>
        </header>

        <WorkflowCanvas
          key={canvasKey}
          item={item}
          mode={mode}
          isPaused={isPaused}
        />

      </div>
    </div>
  )
}
