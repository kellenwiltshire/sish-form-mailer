import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './main.css'
import Dashboard from './components/Dashboard/Dashboard.tsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
	},
	{
		path: '/dashboard',
		element: <Dashboard />,
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
