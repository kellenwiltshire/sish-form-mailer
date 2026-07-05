import {
	ChevronRightIcon,
	ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import useSWR from 'swr'
import { fetcher } from '@/util/SWR/fetch'
import type { Form } from '@/types/Form/Form'
import FormPage from './FormPage'
import { useState } from 'react'
import { classNames } from '@/util/Classnames/Classnames'

type FormsResponse = {
	forms: Form[]
}

const FormsList = () => {
	const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
	const { data, error } = useSWR<FormsResponse, Error>('/api/forms', fetcher)

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const { forms } = data

	return (
		<main>
			<header className='flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
				<h1 className='text-base/7 font-semibold text-gray-900'>Forms</h1>

				{/* Sort dropdown */}
				<Menu as='div' className='relative'>
					<MenuButton className='flex items-center gap-x-1 text-sm/6 font-medium text-gray-900'>
						Sort by
						<ChevronUpDownIcon
							aria-hidden='true'
							className='size-5 text-gray-500'
						/>
					</MenuButton>
					<MenuItems
						transition
						className='absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in'
					>
						<MenuItem>
							<a
								href='#'
								className='block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden'
							>
								Name
							</a>
						</MenuItem>
						<MenuItem>
							<a
								href='#'
								className='block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden'
							>
								Date updated
							</a>
						</MenuItem>
						<MenuItem>
							<a
								href='#'
								className='block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden'
							>
								Environment
							</a>
						</MenuItem>
					</MenuItems>
				</Menu>
			</header>

			<div className='flex h-screen flex-row gap-2 divide-x divide-gray-200 border-r-gray-200'>
				<ul role='list' className='divide-y divide-gray-100'>
					{forms.map((form) => (
						<li
							key={form.id}
							className={classNames(
								form.id === selectedFormId
									? 'bg-gray-100 text-indigo-600'
									: 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600',
								'group flex w-full cursor-pointer gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
								'relative flex items-center space-x-4 px-4 py-4 hover:bg-gray-100 sm:px-6 lg:px-8',
							)}
						>
							<div className='min-w-0 flex-auto'>
								<div className='flex items-center gap-x-3'>
									<h2 className='min-w-0 text-sm/6 font-semibold text-gray-900'>
										<button
											onClick={() => setSelectedFormId(form.id)}
											className='cursor-pointer'
										>
											<span className='truncate'>
												{form.name.toLocaleUpperCase()}
											</span>
											<span className='absolute inset-0' />
										</button>
									</h2>
								</div>
								<div className='mt-3 flex items-center gap-x-2.5 text-xs/5 text-gray-500'>
									<p className='truncate'>Target Email: {form.target_email}</p>
									<p className='truncate'>Form ID: {form.id}</p>
								</div>
							</div>

							<ChevronRightIcon
								aria-hidden='true'
								className='size-5 flex-none text-gray-400'
							/>
						</li>
					))}
				</ul>
				{selectedFormId && (
					<div className='w-full'>
						<FormPage formId={selectedFormId} />
					</div>
				)}
			</div>
		</main>
	)
}

export default FormsList
