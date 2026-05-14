import { Handle, Position } from '@xyflow/react'

// 8 handles per node — 4 positions × (source + target)
// Invisible to the user, used only for edge routing direction
const HANDLE_DEFS = [
  { id: 'top-s',    type: 'source', position: Position.Top    },
  { id: 'right-s',  type: 'source', position: Position.Right  },
  { id: 'bottom-s', type: 'source', position: Position.Bottom },
  { id: 'left-s',   type: 'source', position: Position.Left   },
  { id: 'top-t',    type: 'target', position: Position.Top    },
  { id: 'right-t',  type: 'target', position: Position.Right  },
  { id: 'bottom-t', type: 'target', position: Position.Bottom },
  { id: 'left-t',   type: 'target', position: Position.Left   },
]

export default function WorkflowNode({ data }) {
  const { icon, title, desc, family, state, moduleIndex, branchCaption, branchType } = data
  const labelClass = branchType === 'ko' ? 'warning' : family

  return (
    <div className={`wf-node ${family} ${state || 'idle'}`}>
      {HANDLE_DEFS.map(h => (
        <Handle
          key={h.id} id={h.id} type={h.type}
          position={h.position} isConnectable={false}
        />
      ))}

      {branchCaption && (
        <div className={`wf-branch-label ${branchType}`}>{branchCaption}</div>
      )}

      <div className={`wf-module-label ${labelClass}`}>Module {moduleIndex}</div>
      <div className="wf-step-icon">{icon}</div>
      <div className="wf-step-title">{title}</div>
      {desc && <div className="wf-step-desc">{desc}</div>}
    </div>
  )
}
