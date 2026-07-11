import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
	updateDeleteFormModalOpen,
	updateSelectedForm,
} from '@/redux/modalSlice/modalSlice'
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react/jsx-runtime'
import Button from '../UI/Button'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

const DeleteFormModal = () => {
	const { mutate } = useSWRConfig()
	const dispatch = useAppDispatch()
	const { deleteFormModalOpen, selectedForm: form } = useAppSelector(
		(state) => state.modal,
	)

	const handleDelete = () => {
		if (!form) return
		fetch(`/api/forms/${form.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('Form Delete')
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
			.finally(() => {
				mutate('/api/forms')
				dispatch(updateSelectedForm(null))
				dispatch(updateDeleteFormModalOpen(false))
			})
	}

	if (!form) {
		dispatch(updateDeleteFormModalOpen(false))
		return null
	}

	return (
		<Transition show={deleteFormModalOpen} as={Fragment}>
			<Dialog
				as='div'
				className='relative z-99'
				onClose={() => dispatch(updateDeleteFormModalOpen(false))}
			>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity' />
				</TransitionChild>

				<div className='fixed inset-0 z-50 overflow-y-auto'>
					<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
						<TransitionChild
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
							enterTo='opacity-100 translate-y-0 sm:scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 translate-y-0 sm:scale-100'
							leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						>
							<DialogPanel className='relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
								<div className='flex flex-col gap-4'>
									<h3 className='text-center text-2xl'>
										Delete Form {form.name}?
									</h3>
									<div className='flex flex-row gap-2'>
										<Button
											variant='ghost'
											onClick={() => dispatch(updateDeleteFormModalOpen(false))}
										>
											Cancel
										</Button>
										<Button variant='danger' onClick={() => handleDelete()}>
											Delete
										</Button>
									</div>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default DeleteFormModal
