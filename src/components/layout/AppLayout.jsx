import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import { useAuth } from '../../auth/AuthProvider'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/projets', label: 'Projets', icon: '🏗️' },
  { path: '/achats', label: 'Achats', icon: '🛒' },
  { path: '/logistique', label: 'Logistique', icon: '🚛' },
  { path: '/personnel', label: 'Personnel', icon: '👷' },
  { path: '/journal', label: 'Journal', icon: '📒' },
]

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        borderRight: '1px solid #334155',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#38bdf8' }}>Nysoa BTP</h2>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {user?.email}
          </p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1.5rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                color: isActive ? '#38bdf8' : '#94a3b8',
                background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #334155' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
