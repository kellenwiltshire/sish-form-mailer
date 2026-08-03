import { useState } from 'react'
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	TransitionChild,
} from '@headlessui/react'
import {
	ArrowsRightLeftIcon,
	Cog6ToothIcon,
	GlobeAltIcon,
	PaperClipIcon,
	SignalIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/20/solid'
import Forms from './Sections/Forms/FormsPage'
import EmailPage from './Sections/Email/EmailPage'
import { classNames } from '@/util/Classnames/Classnames'
import useSWR from 'swr'
import { fetcher } from '@/util/SWR/fetch'
import { useAppDispatch } from '@/redux/hooks'
import { updateUser } from '@/redux/userSlice/userSlice'
import { Scope, type User } from '@/types/User/User'
import SettingsPage from './Sections/Settings/SettingsPage'
import FormsPage from './Sections/Forms/FormsPage'
import Button from '../UI/Button'
import { useNavigate } from 'react-router'
import OriginsPage from './Sections/Origins/OriginPage'
import AdminPage from './Sections/Admin/AdminPage'

type GetUsersResponse = {
	user: User
}

const navigation = [
	{
		name: 'Form',
		id: 'form',
		icon: PaperClipIcon,
		access: [Scope.USER, Scope.ADMIN, Scope.SUPER_ADMIN],
	},
	{
		name: 'Email Settings',
		id: 'email',
		icon: SignalIcon,
		access: [Scope.USER, Scope.ADMIN, Scope.SUPER_ADMIN],
	},
	{
		name: 'Allowed Origins',
		id: 'origins',
		icon: ArrowsRightLeftIcon,
		access: [Scope.USER, Scope.ADMIN, Scope.SUPER_ADMIN],
	},
	{
		name: 'Admin',
		id: 'admin',
		icon: GlobeAltIcon,
		access: [Scope.ADMIN, Scope.SUPER_ADMIN],
	},
	{
		name: 'Settings',
		id: 'settings',
		icon: Cog6ToothIcon,
		access: [Scope.USER, Scope.ADMIN, Scope.SUPER_ADMIN],
	},
]

const Dashboard = () => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const [currentView, setCurrentView] = useState('form')

	const { data, error } = useSWR<GetUsersResponse, Error>('/api/user', fetcher)

	if (error) {
		console.log(error)
	}

	if (data) {
		dispatch(updateUser(data.user))
	}

	const getView = () => {
		switch (currentView) {
			case 'form':
				return <FormsPage />
			case 'email':
				return <EmailPage />
			case 'origins':
				return <OriginsPage />
			case 'admin':
				return <AdminPage />
			case 'settings':
				return <SettingsPage />
			default:
				return <Forms />
		}
	}

	const handleLogout = () => {
		fetch('/api/auth/logout', {
			method: 'GET',
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				navigate('/')
			})
			.catch((err) => {
				console.error(err)
			})
	}

	if (!data) return null

	return (
		<>
			<div>
				<Dialog
					open={sidebarOpen}
					onClose={setSidebarOpen}
					className='relative z-50 xl:hidden'
				>
					<DialogBackdrop
						transition
						className='fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0'
					/>

					<div className='fixed inset-0 flex'>
						<DialogPanel
							transition
							className='relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full'
						>
							<TransitionChild>
								<div className='absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0'>
									<button
										type='button'
										onClick={() => setSidebarOpen(false)}
										className='-m-2.5 p-2.5'
									>
										<span className='sr-only'>Close sidebar</span>
										<XMarkIcon
											aria-hidden='true'
											className='size-6 text-white'
										/>
									</button>
								</div>
							</TransitionChild>

							{/* Sidebar component, swap this element with another sidebar if you like */}
							<div className='relative flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6'>
								<div className='relative flex h-16 shrink-0 items-center'>
									<img
										alt='Your Company'
										src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
										className='h-8 w-auto'
									/>
								</div>
								<nav className='relative flex flex-1 flex-col'>
									<ul role='list' className='flex flex-1 flex-col gap-y-7'>
										<li>
											<ul role='list' className='-mx-2 space-y-1'>
												{navigation.map((item) => {
													if (!item.access.includes(data?.user.role)) {
														return null
													}
													return (
														<li key={item.name}>
															<a
																href={item.id}
																className={classNames(
																	item.id === currentView
																		? 'bg-gray-100 text-indigo-600'
																		: 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600',
																	'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
																)}
															>
																<item.icon
																	aria-hidden='true'
																	className={classNames(
																		item.id === currentView
																			? 'text-indigo-600'
																			: 'text-gray-400 group-hover:text-indigo-600',
																		'size-6 shrink-0',
																	)}
																/>
																{item.name}
															</a>
														</li>
													)
												})}
											</ul>
										</li>
									</ul>
								</nav>
							</div>
						</DialogPanel>
					</div>
				</Dialog>

				{/* Static sidebar for desktop */}
				<div className='hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col'>
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className='flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6 ring-1 ring-gray-200'>
						<div className='flex h-16 shrink-0 items-center'>
							<img
								alt='Your Company'
								src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
								className='h-8 w-auto'
							/>
						</div>
						<nav className='flex flex-1 flex-col'>
							<ul role='list' className='flex flex-1 flex-col gap-y-7'>
								<li>
									<ul role='list' className='-mx-2 space-y-1'>
										{navigation.map((item) => {
											if (!item.access.includes(data?.user.role)) {
												return null
											}
											return (
												<li key={item.name}>
													<button
														onClick={() => setCurrentView(item.id)}
														className={classNames(
															item.id === currentView
																? 'bg-gray-100 text-indigo-600'
																: 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600',
															'group flex w-full cursor-pointer gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
														)}
													>
														<item.icon
															aria-hidden='true'
															className={classNames(
																item.id === currentView
																	? 'text-indigo-600'
																	: 'text-gray-400 group-hover:text-indigo-600',
																'size-6 shrink-0',
															)}
														/>
														{item.name}
													</button>
												</li>
											)
										})}
									</ul>
								</li>
							</ul>
						</nav>
						<div className='p-2'>
							<Button onClick={() => handleLogout()}>Logout</Button>
						</div>
					</div>
				</div>

				<div className='xl:pl-72'>
					{/* Sticky search header */}
					<div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-xs sm:px-6 lg:hidden lg:px-8'>
						<button
							type='button'
							onClick={() => setSidebarOpen(true)}
							className='-m-2.5 p-2.5 text-gray-900 xl:hidden'
						>
							<span className='sr-only'>Open sidebar</span>
							<Bars3Icon aria-hidden='true' className='size-5' />
						</button>
					</div>
					<main className='flex min-h-screen items-center justify-center'>
						{getView()}
					</main>
				</div>
			</div>
		</>
	)
}

export default Dashboard
