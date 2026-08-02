import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter, redirect } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './main.css'
import Dashboard from './components/Dashboard/Dashboard.tsx'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import ModalProvider from './providers/ModalProvider.tsx'
import { SWRConfig } from 'swr'
import { updateUser } from './redux/userSlice/userSlice.ts'
import type { User } from './types/User/User.ts'

export async function checkAuthStatus(): Promise<User | null> {
	try {
		const res = await fetch('/api/user', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		})

		if (!res.ok) return null

		const userData: User = await res.json()

		store.dispatch(updateUser(userData))

		return userData
	} catch (error) {
		console.error('Session check failed:', error)
		return null
	}
}

const router = createBrowserRouter([
	{
		path: '/',
		loader: async () => {
			const user = await checkAuthStatus()
			if (user) {
				return redirect('/dashboard')
			}
			return null
		},
		element: <App />,
	},
	{
		path: '/dashboard',
		loader: async () => {
			const user = await checkAuthStatus()
			if (!user) {
				return redirect('/')
			}
			return null
		},
		element: <Dashboard />,
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<SWRConfig value={{ provider: () => new Map() }}>
				<ModalProvider>
					<>
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
					</>
				</ModalProvider>
			</SWRConfig>
		</Provider>
	</StrictMode>,
)
