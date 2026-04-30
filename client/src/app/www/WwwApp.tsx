import { createBrowserRouter, RouterProvider, Outlet } from 'react-router'
import { WwwNav } from './components/WwwNav'
import { WwwFooter } from './components/WwwFooter'
import { Home } from './pages/Home'
import { Pricing } from './pages/Pricing'
import { Payment } from './pages/Payment'

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <WwwNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <WwwFooter />
    </div>
  )
}

/** Payment page gets its own layout without nav/footer chrome */
function PaymentLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pricing', element: <Pricing /> },
    ],
  },
  {
    path: '/pay',
    element: <PaymentLayout />,
    children: [{ index: true, element: <Payment /> }],
  },
])

export function WwwApp() {
  return <RouterProvider router={router} />
}
