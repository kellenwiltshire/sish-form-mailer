import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateAddOriginModalOpen } from '@/redux/modalSlice/modalSlice'
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react/jsx-runtime'
import Input from '../UI/Input'
import Button from '../UI/Button'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

const AddOriginModal = () => {
	const { mutate } = useSWRConfig()
	const dispatch = useAppDispatch()
	const { addOriginModalOpen } = useAppSelector((state) => state.modal)

	const handleSubmit = (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const { origin } = formData

		fetch('/api/origins', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				origin,
			}),
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('Origin Created')
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
			.finally(() => {
				mutate('/api/origins')
				dispatch(updateAddOriginModalOpen(false))
			})
	}

	return (
		<Transition show={addOriginModalOpen} as={Fragment}>
			<Dialog
				as='div'
				className='relative z-99'
				onClose={() => dispatch(updateAddOriginModalOpen(false))}
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
									<h3 className='text-center text-2xl'>Create Origin</h3>
									<form action={handleSubmit} className='flex flex-col gap-4'>
										<Input
											id='origin'
											name='origin'
											placeholder='http(s)://...'
											type='text'
											label='Origin Address'
										/>

										<div className='flex flex-row gap-2'>
											<Button
												variant='ghost'
												onClick={() =>
													dispatch(updateAddOriginModalOpen(false))
												}
											>
												Cancel
											</Button>
											<Button type='submit'>Submit</Button>
										</div>
									</form>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default AddOriginModal
