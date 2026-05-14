import { useEffect, useRef, useState } from 'react'
import { ReactFlow, useNodesState, useEdgesState, Background, useReactFlow } from '@xyflow/react'
import WorkflowNode from './WorkflowNode.jsx'

/* ── Node types — edges use built-in smoothstep ── */
const NODE_TYPES = { workflowNode: WorkflowNode }

/* ── Edge colors ── */
const EDGE_COLOR = {
  airtable: '#5BA3F5',
  make:     '#60D0A0',
  ok:       '#60D0A0',
  ko:       '#E8B84A',
}
const GHOST_STYLE = { stroke: 'rgba(255,255,255,.08)', strokeWidth: 2 }

/* ── Layout constants ── */
const CARD_W   = 220
const H_GAP    = 310
const V_GAP    = 260
const TOP_PAD  = 60
const BRANCH_Y = 110

/* ─────────────────────────────────────────────
   HANDLE DIRECTION
────────────────────────────────────────────── */
function getHandles(p1, p2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { sh: 'right-s', th: 'left-t' } : { sh: 'left-s', th: 'right-t' }
  }
  return dy > 0 ? { sh: 'bottom-s', th: 'top-t' } : { sh: 'top-s', th: 'bottom-t' }
}

/* ─────────────────────────────────────────────
   POSITIONS
────────────────────────────────────────────── */
function linearPositions(count, layout) {
  if (layout === 'simple') {
    const span = (count - 1) * H_GAP
    return Array.from({ length: count }, (_, i) => ({ x: -span / 2 + i * H_GAP, y: 0 }))
  }
  const col0 = -H_GAP
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / 3), col = i % 3
    return { x: col0 + (row % 2 === 0 ? col : 2 - col) * H_GAP, y: TOP_PAD + row * V_GAP }
  })
}

function routerPositions(preCount) {
  const totalCols = preCount + 3
  const startX = -((totalCols - 1) * H_GAP) / 2
  const routerX = startX + preCount * H_GAP
  const b1X = routerX + H_GAP, b2X = routerX + H_GAP * 2
  return {
    pre:    Array.from({ length: preCount }, (_, i) => ({ x: startX + i * H_GAP, y: 0 })),
    router: { x: routerX, y: 0 },
    ok1: { x: b1X, y: -BRANCH_Y }, ko1: { x: b1X, y: +BRANCH_Y },
    ok2: { x: b2X, y: -BRANCH_Y }, ko2: { x: b2X, y: +BRANCH_Y },
  }
}

/* ─────────────────────────────────────────────
   GRAPH BUILDERS
────────────────────────────────────────────── */
function approxDur(p1, p2) {
  return Math.max(400, Math.round(200 + (Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)) * 0.3))
}

function mkNode(id, pos, step, family, extra = {}) {
  return {
    id: String(id), type: 'workflowNode', position: pos, width: CARD_W,
    data: { icon: step[0], title: step[1], desc: step[2] || '', family, state: 'idle', moduleIndex: id + 1, ...extra },
  }
}

function mkEdge(id, src, tgt, colorClass, p1, p2, extra = {}) {
  const { sh, th } = getHandles(p1, p2)
  return {
    id, source: String(src), target: String(tgt),
    sourceHandle: sh, targetHandle: th,
    type: 'smoothstep',
    animated: false,
    style: GHOST_STYLE,
    data: { colorClass, dur: approxDur(p1, p2), ...extra },
  }
}

function buildGraph(item) {
  const cc = item.type === 'Airtable' ? 'airtable' : 'make'
  if (item.layout === 'router') {
    const preCount = item.preSteps.length
    const pos = routerPositions(preCount)
    const rIdx = preCount, ok1 = rIdx + 1, ko1 = rIdx + 2, ok2 = rIdx + 3, ko2 = rIdx + 4
    const nodes = [
      ...item.preSteps.map((s, i) => mkNode(i, pos.pre[i], s, cc)),
      mkNode(rIdx, pos.router, item.router, 'router', { isRouter: true }),
      mkNode(ok1, pos.ok1, item.branches.ok.steps[0], cc, { branchCaption: item.branches.ok.caption, branchType: 'ok' }),
      mkNode(ko1, pos.ko1, item.branches.ko.steps[0], cc, { branchCaption: item.branches.ko.caption, branchType: 'ko' }),
    ]
    if (item.branches.ok.steps[1]) nodes.push(mkNode(ok2, pos.ok2, item.branches.ok.steps[1], cc))
    if (item.branches.ko.steps[1]) nodes.push(mkNode(ko2, pos.ko2, item.branches.ko.steps[1], cc))
    const edges = [
      ...Array.from({ length: preCount - 1 }, (_, i) =>
        mkEdge(`pre${i}`, i, i + 1, cc, pos.pre[i], pos.pre[i + 1])),
      mkEdge('to-router', preCount - 1, rIdx, cc, pos.pre[preCount - 1], pos.router),
      mkEdge('router-ok', rIdx, ok1, 'ok', pos.router, pos.ok1),
      mkEdge('router-ko', rIdx, ko1, 'ko', pos.router, pos.ko1),
    ]
    if (item.branches.ok.steps[1]) edges.push(mkEdge('ok-next', ok1, ok2, 'ok', pos.ok1, pos.ok2))
    if (item.branches.ko.steps[1]) edges.push(mkEdge('ko-next', ko1, ko2, 'ko', pos.ko1, pos.ko2))
    return { nodes, edges }
  }
  const positions = linearPositions(item.steps.length, item.layout)
  const nodes = item.steps.map((s, i) => mkNode(i, positions[i], s, cc))
  const edges = Array.from({ length: item.steps.length - 1 }, (_, i) =>
    mkEdge(`e${i}`, i, i + 1, cc, positions[i], positions[i + 1]))
  return { nodes, edges }
}

/* ─────────────────────────────────────────────
   TIMER UTILITIES
────────────────────────────────────────────── */
function clearTimers(ref) {
  ref.current.active.forEach(t => clearTimeout(t.id))
  ref.current.active = []
}
function scheduleTimer(ref, fn, delay) {
  const fireAt = Date.now() + delay
  const meta = { fn, fireAt, id: null }
  meta.id = setTimeout(() => {
    ref.current.active = ref.current.active.filter(t => t !== meta)
    fn()
  }, delay)
  ref.current.active.push(meta)
}

/* ─────────────────────────────────────────────
   ANIMATE EDGE — toggle to colored + flowing
────────────────────────────────────────────── */
function activateEdge(eid, edges, setEdges) {
  setEdges(es => es.map(e => {
    if (e.id !== eid) return e
    const c = EDGE_COLOR[e.data.colorClass] || EDGE_COLOR.make
    return {
      ...e,
      animated: true,
      style: { stroke: c, strokeWidth: 2.5, filter: `drop-shadow(0 0 5px ${c})` },
    }
  }))
}

/* ─────────────────────────────────────────────
   ANIMATION SEQUENCES
────────────────────────────────────────────── */
function runLinear(item, edges, setNodes, setEdges, timersRef, setActiveNodeId, onDone) {
  const count = item.steps.length
  const PACE  = count <= 5 ? 600 : count <= 7 ? 850 : 850

  const setNS = (id, state) => {
    if (state === 'active') setActiveNodeId(String(id))
    setNodes(ns => ns.map(n => n.id === String(id) ? { ...n, data: { ...n.data, state } } : n))
  }
  const setES  = eid => activateEdge(eid, edges, setEdges)
  const getDur = eid => edges.find(e => e.id === eid)?.data?.dur ?? 400
  const sched  = (fn, d) => scheduleTimer(timersRef, fn, d)

  let cursor = 0
  setNS(0, 'active')
  for (let i = 0; i < count - 1; i++) {
    const eid = `e${i}`, dur = getDur(eid)
    cursor += PACE
    sched(() => { setES(eid); setNS(i, 'done') }, cursor)
    cursor += dur
    sched(() => setNS(i + 1, 'active'), cursor)
  }
  cursor += PACE
  sched(() => { setNS(count - 1, 'done'); onDone() }, cursor)
}

function runRouter(item, mode, edges, setNodes, setEdges, timersRef, setActiveNodeId, onDone) {
  const preCount = item.preSteps.length, rIdx = preCount, PACE = 1000

  const setNS = (id, state) => {
    if (state === 'active') setActiveNodeId(String(id))
    setNodes(ns => ns.map(n => n.id === String(id) ? { ...n, data: { ...n.data, state } } : n))
  }
  const setES  = eid => activateEdge(eid, edges, setEdges)
  const getDur = eid => edges.find(e => e.id === eid)?.data?.dur ?? 400
  const sched  = (fn, d) => scheduleTimer(timersRef, fn, d)

  // Re-color pre-step edges to match selected branch before animation starts
  const modeColor = mode === 'ko' ? 'ko' : 'make'
  setEdges(es => es.map(e =>
    (e.id.startsWith('pre') || e.id === 'to-router')
      ? { ...e, data: { ...e.data, colorClass: modeColor } }
      : e
  ))

  const branch1    = mode === 'ko' ? rIdx + 2 : rIdx + 1
  const branch2    = mode === 'ko' ? rIdx + 4 : rIdx + 3
  const routerEdge = mode === 'ko' ? 'router-ko' : 'router-ok'
  const nextEdge   = mode === 'ko' ? 'ko-next'   : 'ok-next'
  const hasNext    = mode === 'ko' ? !!item.branches.ko.steps[1] : !!item.branches.ok.steps[1]

  let cursor = 0
  setNS(0, 'active')
  for (let i = 0; i < preCount - 1; i++) {
    const eid = `pre${i}`, dur = getDur(eid)
    cursor += PACE
    sched(() => { setES(eid); setNS(i, 'done') }, cursor)
    cursor += dur
    sched(() => setNS(i + 1, 'active'), cursor)
  }
  cursor += PACE
  sched(() => { setES('to-router'); setNS(preCount - 1, 'done') }, cursor)
  cursor += getDur('to-router')
  sched(() => setNS(rIdx, 'active'), cursor)
  cursor += PACE
  sched(() => { setES(routerEdge); setNS(rIdx, 'done') }, cursor)
  cursor += getDur(routerEdge)
  sched(() => setNS(branch1, 'active'), cursor)
  if (hasNext) {
    cursor += PACE
    sched(() => { setES(nextEdge); setNS(branch1, 'done') }, cursor)
    cursor += getDur(nextEdge)
    sched(() => setNS(branch2, 'active'), cursor)
    cursor += PACE
    sched(() => { setNS(branch2, 'done'); onDone() }, cursor)
  } else {
    cursor += PACE
    sched(() => { setNS(branch1, 'done'); onDone() }, cursor)
  }
}

/* ─────────────────────────────────────────────
   CAMERA CONTROLLER (simplified)
   fitView is handled by the ReactFlow fitView prop.
   This component only manages the 2s overview delay
   and the page-based camera follow.
────────────────────────────────────────────── */
function CameraController({ startRef, activeNodeId, nodePositionsRef, totalNodeCount, animDone }) {
  const { setCenter, fitView } = useReactFlow()
  const startedRef     = useRef(false)
  const overviewRef    = useRef(null)
  const currentPageRef = useRef(-1)
  const followZoomRef  = useRef(null)

  const calcFollowZoom = () => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1100
    return Math.min(0.92, Math.max(0.25, (vw * 0.88) / (5 * H_GAP)))
  }

  useEffect(() => {
    if (totalNodeCount === 0 || startedRef.current) return
    startedRef.current = true

    const initTid = setTimeout(() => {
      if (totalNodeCount > 5) {
        const fz = calcFollowZoom()
        followZoomRef.current = fz
        const page0Pos = nodePositionsRef.current['0']
        if (page0Pos) {
          // Single smooth move directly to page 0 during the overview (1700ms).
          // interpolate:'linear' (v12.7+) prevents any zoom-related jump.
          // Goes straight from fitView position to page 0 — no two-step detour.
          setCenter(page0Pos.x + H_GAP * 2, page0Pos.y, {
            zoom: fz, duration: 2500, interpolate: 'linear',
          })
          currentPageRef.current = 0
        }
      }

      // Small workflows (≤5 nodes): no zoomTo → start almost immediately
      overviewRef.current = setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => startRef.current?.()))
      }, totalNodeCount <= 5 ? 100 : 2000)
    }, 300)

    return () => clearTimeout(initTid)
  }, [totalNodeCount]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(overviewRef.current), [])

  /* End of animation → immediate dezoom to global view */
  useEffect(() => {
    if (!animDone) return
    const tid = setTimeout(() => {
      fitView({ duration: 1200, padding: 0.2 })
    }, 5)
    return () => clearTimeout(tid)
  }, [animDone, fitView])

  /* Camera triggered on the LAST card of each window (index 4, 9, 14…)
     → camera starts gliding to the next page while that card is still animating */
  useEffect(() => {
    if (!activeNodeId || totalNodeCount <= 5) return
    const idx = parseInt(activeNodeId, 10)
    if (isNaN(idx)) return

    // Only fire on the last card of a 5-card window (idx % 5 === 4)
    if (idx % 5 !== 4) return

    const nextPage      = Math.floor(idx / 5) + 1
    const nextPageStart = nextPage * 5
    if (nextPageStart >= totalNodeCount) return      // no next window
    if (nextPage === currentPageRef.current) return  // already there

    currentPageRef.current = nextPage
    const pageStartPos = nodePositionsRef.current[String(nextPageStart)]
    if (!pageStartPos) return

    const fz = followZoomRef.current || calcFollowZoom()
    setCenter(pageStartPos.x + H_GAP * 2, pageStartPos.y, {
      zoom: fz, duration: 1500, interpolate: 'linear',
    })
  }, [activeNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────── */
export default function WorkflowCanvas({ item, mode = 'default', isPaused }) {
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const [activeNodeId,   setActiveNodeId]   = useState(null)
  const [totalNodeCount, setTotalNodeCount] = useState(0)
  const [animDone,       setAnimDone]       = useState(false)

  const timersRef           = useRef({ active: [] })
  const pausedRef           = useRef(null)
  const nodePositionsRef    = useRef({})
  const startRef            = useRef(null)
  const animationStartedRef = useRef(false)

  useEffect(() => {
    clearTimers(timersRef)
    pausedRef.current           = null
    animationStartedRef.current = false
    setAnimDone(false)

    const graph = buildGraph(item)

    const positions = {}
    graph.nodes.forEach(n => { positions[n.id] = n.position })
    nodePositionsRef.current = positions

    startRef.current = () => {
      if (animationStartedRef.current) return  // absolute guard: runs exactly once
      animationStartedRef.current = true
      if (item.layout === 'router') {
        runRouter(item, mode, graph.edges, setNodes, setEdges, timersRef, setActiveNodeId, () => setAnimDone(true))
      } else {
        runLinear(item, graph.edges, setNodes, setEdges, timersRef, setActiveNodeId, () => setAnimDone(true))
      }
    }

    setNodes(graph.nodes)
    setEdges(graph.edges)
    setTotalNodeCount(graph.nodes.length)
    setActiveNodeId(null)

    return () => clearTimers(timersRef)
  }, [item, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPaused) {
      const now = Date.now()
      pausedRef.current = timersRef.current.active.map(t => ({
        fn: t.fn, delay: Math.max(10, t.fireAt - now),
      }))
      timersRef.current.active.forEach(t => clearTimeout(t.id))
      timersRef.current.active = []
    } else if (pausedRef.current) {
      const pending = pausedRef.current
      pausedRef.current = null
      pending.forEach(({ fn, delay }) => scheduleTimer(timersRef, fn, delay))
    }
  }, [isPaused])

  return (
    <div className="rf-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        nodeOrigin={[0.5, 0.5]}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag
        minZoom={0.15}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" color="rgba(255,255,255,.05)" gap={24} size={1.5} />
        <CameraController
          startRef={startRef}
          activeNodeId={activeNodeId}
          nodePositionsRef={nodePositionsRef}
          totalNodeCount={totalNodeCount}
          animDone={animDone}
        />
      </ReactFlow>
    </div>
  )
}
