import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const fmt = (n) => new Intl.NumberFormat('fr-MG').format(Math.round(n || 0)) + ' Ar'

const STATUT_COLOR = {
  commande: '#f59e0b',
  recu: '#22c55e',
  partiel: '#38bdf8',
  annule: '#ef4444',
}

export default function Achats() {
  const [achats, setAchats] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    async function fetchAchats() {
      const { data } = await supabase
        .from('achats')
        .select(`
          id, numero_bon, date_commande, statut,
          montant_total, montant_paye, notes,
          fournisseurs(nom),
          projets(nom, code)
        `)
        .order('date_commande', { ascending: false })
      setAchats(data || [])
      setLoading(false)
    }
    fetchAchats()
  }, [])

  const filtres = ['tous', 'commande', 'recu', 'partiel', 'annule']

  const afficheAchats = achats.filter(a => {
    const matchFiltre = filtre === 'tous' || a.statut === filtre
    const matchRecherche = recherche === '' ||
      a.numero_bon?.toLowerCase().includes(recherche.toLowerCase()) ||
      a.fournisseurs?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      a.projets?.nom?.toLowerCase().includes(recherche.toLowerCase())
    return matchFiltre && matchRecherche
  })

  const totalFiltre = afficheAchats.reduce((s, a) => s + (a.montant_total || 0), 0)
  const totalPaye = afficheAchats.reduce((s, a) => s + (a.montant_paye || 0), 0)

  if (loading) return <div style={{ color: '#94a3b8', padding: '2rem' }}>Chargement...</div>

  return (
    <div>
      <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Achats & Bons de commande
      </h1>

      {/* Résumé */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: fmt(totalFiltre), color: '#38bdf8' },
          { label: 'Payé', value: fmt(totalPaye), color: '#22c55e' },
          { label: 'Reste', value: fmt(totalFiltre - totalPaye), color: '#f59e0b' },
          { label: 'Bons', value: afficheAchats.length, color: '#a78bfa' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '1rem', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{k.label}</div>
            <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '700' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {filtres.map(f => (
          <button key={f} onClick={() => setFiltre(f)} style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            background: filtre === f ? '#38bdf8' : '#1e293b',
            color: filtre === f ? '#0f172a' : '#94a3b8',
            fontWeight: filtre === f ? '700' : '400',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input
          placeholder="Rechercher..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '0.4rem 0.8rem',
            borderRadius: '8px', border: '1px solid #334155',
            background: '#1e293b', color: '#f8fafc', fontSize: '0.85rem',
          }}
        />
      </div>

      {/* Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {afficheAchats.length === 0 && (
          <p style={{ color: '#64748b' }}>Aucun achat trouvé.</p>
        )}
        {afficheAchats.map(a => (
          <div key={a.id} style={{
            background: '#1e293b', borderRadius: '10px',
            padding: '1rem', borderLeft: `3px solid ${STATUT_COLOR[a.statut] || '#64748b'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.95rem' }}>
                  {a.numero_bon}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                  {a.fournisseurs?.nom || '—'} · {a.projets?.nom || 'Sans projet'}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                  {a.date_commande}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f8fafc', fontWeight: '700' }}>{fmt(a.montant_total)}</div>
                <div style={{ color: '#22c55e', fontSize: '0.8rem' }}>Payé : {fmt(a.montant_paye)}</div>
                <span style={{
                  display: 'inline-block', marginTop: '4px',
                  background: (STATUT_COLOR[a.statut] || '#64748b') + '22',
                  color: STATUT_COLOR[a.statut] || '#64748b',
                  fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600',
                }}>
                  {a.statut}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
