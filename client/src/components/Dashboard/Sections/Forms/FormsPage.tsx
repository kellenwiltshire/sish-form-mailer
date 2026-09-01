import { ChevronRightIcon } from '@heroicons/react/24/outline'
import useSWR from 'swr'
import { fetcher } from '@/util/SWR/fetch'
import type { Form } from '@/types/Form/Form'
import { useState } from 'react'
import { classNames } from '@/util/Classnames/Classnames'
import PageLayout from '@/Layout/PageLayout'
import Button from '@/components/UI/Button'
import Submissions from './Submissions'
import { useAppDispatch } from '@/redux/hooks'
import {
	updateAddFormModalOpen,
	updateSelectedForm,
} from '@/redux/modalSlice/modalSlice'

type FormsResponse = {
	forms: Form[]
}

const FormsPage = () => {
	const dispatch = useAppDispatch()
	const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
	const { data, error } = useSWR<FormsResponse, Error>('/api/forms', fetcher, {
		revalidateOnMount: true,
		revalidateIfStale: true,
	})

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const { forms } = data

	return (
		<PageLayout
			title='Forms'
			button={
				<Button onClick={() => dispatch(updateAddFormModalOpen(true))}>
					Add Form
				</Button>
			}
			topMargin={false}
		>
			<div className='flex h-screen flex-row divide-x divide-gray-200 border-r-gray-200'>
				<ul role='list' className='divide-y divide-gray-100'>
					{forms &&
						forms.map((form) => (
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
												onClick={() => {
													setSelectedFormId(form.id)
													dispatch(updateSelectedForm(form))
												}}
												className='cursor-pointer'
											>
												<span className='truncate'>
													{form.name.toLocaleUpperCase()}
												</span>
												<span className='absolute inset-0' />
											</button>
										</h2>
									</div>
									<div className='justify-center-center mt-3 flex flex-col gap-2.5 text-xs/5 text-gray-500'>
										<p className='truncate'>
											Target Email: {form.target_email}
										</p>
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
				{selectedFormId ? (
					<div className='w-full'>
						<Submissions formId={selectedFormId} />
					</div>
				) : (
					<div className='mx-auto flex flex-col gap-3'>
						<p className='mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8'>
							Select a Form or
						</p>
						<Button onClick={() => dispatch(updateAddFormModalOpen(true))}>
							Add New Form
						</Button>
					</div>
				)}
			</div>
		</PageLayout>
	)
}

export default FormsPage
