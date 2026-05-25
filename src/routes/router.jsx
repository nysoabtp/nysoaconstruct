import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import LoginPage from '../auth/LoginPage'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/Dashboard'
import Achats from '../pages/Achats'
import Personnel from '../pages/Personnel'
import Logistique from '../pages/Logistique'
import Journal from '../pages/Journal'
import Projets from '../pages/Projets'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'achats', element: <Achats /> },
      { path: 'personnel', element: <Personnel /> },
      { path: 'logistique', element: <Logistique /> },
      { path: 'journal', element: <Journal /> },
      { path: 'projets', element: <Projets /> },
    ],
  },
], { basename: '/nysoabtp' })
