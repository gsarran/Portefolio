import { useState, useCallback } from 'react'
import { AUTOMATIONS } from './data.js'
import WorkflowModal from './WorkflowModal.jsx'

function Badge({ cls, children }) {
  return <span className={`badge ${cls}`}>{children}</span>
}

function AutomationCard({ item, index, onOpen }) {
  const family = item.type === 'Airtable' ? 'airtable' : 'make'
  const layoutLabel = item.layout === 'router' ? 'Router' : item.layout === 'serpentine' ? 'Serpentin' : 'Simple'

  return (
    <article className="automation-card">
      <div className={`automation-index ${family}`}>{index}</div>
      <div>
        <div className="automation-title">{item.title}</div>
        <div className="automation-desc">{item.desc}</div>
        <div className="automation-meta">
          {item.type === 'Airtable' && <Badge cls="badge-airtable">Airtable</Badge>}
          <Badge cls="badge-router">{item.tag}</Badge>
          <Badge cls="badge-warning">{layoutLabel}</Badge>
        </div>
      </div>
      <button className={`btn btn-${family}`} onClick={() => onOpen(item.id)}>
        Voir le workflow
      </button>
    </article>
  )
}

function AutomationSection({ type, target }) {
  const items = AUTOMATIONS.filter(a => a.type === type)
  const sections = [...new Set(items.map(a => a.section))]
  const showHeaders = sections.length > 1

  return (
    <>
      {sections.map((section, idx) => {
        const sectionItems = items.filter(a => a.section === section)
        return (
          <div key={section} style={{ marginTop: idx > 0 ? '2.8rem' : 0 }}>
            {showHeaders && (
              <div className={`group-title${type === 'Make' ? ' make-group' : ''}`}>
                {section}
              </div>
            )}
            <div className="automation-grid">
              {sectionItems.map(item => {
                const globalIndex = items.findIndex(x => x.id === item.id) + 1
                return (
                  <AutomationCard
                    key={item.id}
                    item={item}
                    index={globalIndex}
                    onOpen={target}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

export default function App() {
  const [openId, setOpenId] = useState(null)

  const openModal  = useCallback(id => setOpenId(id), [])
  const closeModal = useCallback(() => setOpenId(null), [])

  const activeItem = AUTOMATIONS.find(a => a.id === openId) ?? null

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-inner">
          <a className="nav-brand" href="../index.html">Néobâti Artisanat</a>
          <div className="nav-links">
            <a href="../../index.html">Accueil</a>
            <a href="../../automatisations_explication_simple.html">Valeur métier</a>
            <a href="../../Base_donnees_finale.html">Base</a>
            <a href="../../Explication_champs_bd_technicien.html">Champs</a>
            <a href="../../interfaces_finales_user.html">Interfaces</a>
            <a href="./index.html" className="active">Automatisations</a>
          </div>
        </div>
      </nav>

      <main className="container">
        {/* ── Hero ── */}
        <section className="hero">
          <div className="eyebrow">Automatisations</div>
          <h1><em>Airtable et Make</em></h1>
          <p className="hero-text">
            Cette version regroupe toutes les automatisations Airtable et les scénarios Make.
            Les workflows sont visualisés dans des canvas interactifs style N8N.
          </p>
        </section>

        {/* ── Principe cards ── */}
        <div className="principe-grid">
          <div className="principe-card airtable-card">
            <div className="principe-card-header">
              <div className="principe-logo">🗂️</div>
              <div className="principe-card-title">Airtable</div>
            </div>
            <div className="principe-card-desc">
              Gestion des flux métier internes simples : mise à jour et création de nouveaux enregistrements,
              déclencheurs sur conditions, liaisons entre tables et notifications internes.
            </div>
          </div>
          <div className="principe-card make-card">
            <div className="principe-card-header">
              <div className="principe-logo">🔗</div>
              <div className="principe-card-title">Make</div>
            </div>
            <div className="principe-card-desc">
              Gestion des flux métier complexes et appels à des services externes :
              géocodage Google Maps, scripts d'assignation Google, génération PDF, SMS Twilio,
              emails via IA, relances automatisées.
            </div>
          </div>
        </div>

        {/* ── Airtable section ── */}
        <section className="section">
          <div className="section-header">
            <div className="section-icon airtable">⚙️</div>
            <div className="section-title">
              <h2>Automatisations Airtable</h2>
              <div className="section-subtitle">Automatisations internes à Airtable, classées par section métier.</div>
            </div>
          </div>
          <AutomationSection type="Airtable" target={openModal} />
        </section>

        {/* ── Make section ── */}
        <section className="section">
          <div className="section-header">
            <div className="section-icon make">🔗</div>
            <div className="section-title">
              <h2>Scénarios Make</h2>
              <div className="section-subtitle">Services externes, PDF, SMS, IA — règles métiers complexes.</div>
            </div>
          </div>
          <AutomationSection type="Make" target={openModal} />
        </section>
      </main>

      <footer>
        <div className="container">
          Documentation <strong>Néobâti Artisanat</strong> — Projet de soutenance 2026
        </div>
      </footer>

      {/* ── Modal (mounted at root, outside main) ── */}
      {activeItem && <WorkflowModal item={activeItem} onClose={closeModal} />}
    </>
  )
}
