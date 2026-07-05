import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './main.css'
import Dashboard from './components/Dashboard/Dashboard.tsx'
import { ToastContainer } from 'react-toastify'

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
		<ToastContainer
			position='bottom-center'
			autoClose={5000}
			limit={3}
			hideProgressBar
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss={false}
			draggable
			pauseOnHover={false}
			theme='light'
		/>
	</StrictMode>,
)
