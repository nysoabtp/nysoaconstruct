import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const fmt = (n) => new Intl.NumberFormat('fr-MG').format(Math.round(n || 0)) + ' Ar'

function KPI({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '12px',
      padding: '1.25rem',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '700' }}>{value}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [kpi, setKpi] = useState({})
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        // Achats
        const { data: achats } = await supabase.from('achats').select('montant_total, montant_paye, statut, created_at')
        const totalAchats = achats?.reduce((s, a) => s + (a.montant_total || 0), 0) || 0
        const totalPaye = achats?.reduce((s, a) => s + (a.montant_paye || 0), 0) || 0
        const achatsEnAttente = achats?.filter(a => a.statut === 'commande') || []

        // Journal
        const { data: journal } = await supabase.from('journal_comptable').select('type_ecriture, montant')
        const totalCredits = journal?.filter(j => j.type_ecriture === 'credit').reduce((s, j) => s + (j.montant || 0), 0) || 0
        const totalDebits = journal?.filter(j => j.type_ecriture === 'debit').reduce((s, j) => s + (j.montant || 0), 0) || 0
        const benefice = totalCredits - totalDebits

        // Personnel
        const { data: personnel } = await supabase.from('personnel').select('id, actif')
        const agentsActifs = personnel?.filter(p => p.actif).length || 0

        // Projets
        const { data: projets } = await supabase.from('projets').select('id, nom, statut, budget_initial, budget_depense')
        const projetsEnCours = projets?.filter(p => p.statut === 'en_cours') || []

        // Credits fournisseurs en attente
        const { data: credits } = await supabase.from('credits_fournisseurs').select('montant_restant, statut, fournisseur_id, fournisseurs(nom)').eq('statut', 'en_cours')

        // Pointages aujourd'hui
        const today = new Date().toISOString().split('T')[0]
        const { data: pointages } = await supabase.from('pointages').select('id').eq('date_pointage', today)

        setKpi({
          totalAchats, totalPaye, benefice,
          agentsActifs, projetsEnCours: projetsEnCours.length,
          creditsRestants: credits?.reduce((s, c) => s + (c.montant_restant || 0), 0) || 0,
          pointagesAujourdhui: pointages?.length || 0,
        })

        // Validations en attente
        const vals = []
        achatsEnAttente.slice(0, 5).forEach(a => vals.push({ type: 'Achat', label: `Bon commande — ${fmt(a.montant_total)}`, color: '#f59e0b' }))
        credits?.slice(0, 3).forEach(c => vals.push({ type: 'Crédit', label: `${c.fournisseurs?.nom || 'Fournisseur'} — ${fmt(c.montant_restant)} restant`, color: '#ef4444' }))
        setValidations(vals)

      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div style={{ color: '#94a3b8', padding: '2rem' }}>Chargement...</div>

  return (
    <div>
      <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Tableau de bord
      </h1>

      <Section title="KPI Financiers">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <KPI label="Total Achats" value={fmt(kpi.totalAchats)} color="#38bdf8" icon="🛒" />
          <KPI label="Total Payé" value={fmt(kpi.totalPaye)} color="#22c55e" icon="✅" />
          <KPI label="Reste à payer" value={fmt(kpi.totalAchats - kpi.totalPaye)} color="#f59e0b" icon="⏳" />
          <KPI label="Bénéfice net" value={fmt(kpi.benefice)} color={kpi.benefice >= 0 ? '#22c55e' : '#ef4444'} icon="📈" />
          <KPI label="Crédits fournisseurs" value={fmt(kpi.creditsRestants)} color="#ef4444" icon="🔴" />
        </div>
      </Section>

      <Section title="Activité">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <KPI label="Agents actifs" value={kpi.agentsActifs} color="#a78bfa" icon="👷" />
          <KPI label="Chantiers en cours" value={kpi.projetsEnCours} color="#38bdf8" icon="🏗️" />
          <KPI label="Pointages aujourd'hui" value={kpi.pointagesAujourdhui} color="#22c55e" icon="📋" />
        </div>
      </Section>

      <Section title="Éléments en attente de validation">
        {validations.length === 0 ? (
          <p style={{ color: '#64748b' }}>Aucun élément en attente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {validations.map((v, i) => (
              <div key={i} style={{
                background: '#1e293b',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderLeft: `3px solid ${v.color}`,
              }}>
                <span style={{ background: v.color + '22', color: v.color, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  {v.type}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{v.label}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
