import Button from '@/components/UI/Button'
import { useAppDispatch } from '@/redux/hooks'
import {
	updateDeleteFormModalOpen,
	updateEditFormModalOpen,
	updateSelectedForm,
} from '@/redux/modalSlice/modalSlice'
import type { Form } from '@/types/Form/Form'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

const FormInfo = ({
	showSpamSubmissions,
	setShowSpamSubmissions,
	form,
}: {
	showSpamSubmissions: boolean
	setShowSpamSubmissions: (bool: boolean) => void
	form: Form
}) => {
	const dispatch = useAppDispatch()
	return (
		<dl className='mx-auto flex w-full flex-row flex-wrap justify-between p-2'>
			<div className='flex flex-col flex-wrap items-baseline justify-between gap-y-2 py-10'>
				<dt className='text-sm/6 font-medium text-gray-500'>Form ID</dt>
				<div className='flex flex-row items-center gap-2'>
					<dd className='flex-none text-xl font-medium tracking-tight text-gray-900'>
						{form.id}
					</dd>
					<Button
						onClick={() => {
							navigator.clipboard
								.writeText(form.id)
								.then(() => toast.success('ID Copied to clipboard'))
								.catch(() => toast.error('Unable to copy to clipboard'))
						}}
						variant='ghost'
					>
						<ClipboardDocumentIcon className='h-5 w-5' />
					</Button>
				</div>
			</div>

			<div className='flex flex-wrap items-baseline justify-between gap-y-2 py-10'>
				<dt className='text-sm/6 font-medium text-gray-500'>Form Name</dt>
				<dd className='w-full flex-none text-xl font-medium tracking-tight text-gray-900'>
					{form.name}
				</dd>
			</div>

			<div className='flex flex-wrap items-baseline justify-between gap-y-2 py-10'>
				<dt className='text-sm/6 font-medium text-gray-500'>Target Email</dt>
				<dd className='w-full flex-none text-xl font-medium tracking-tight text-gray-900'>
					{form.target_email}
				</dd>
			</div>
			<div className='flex flex-row items-center gap-2'>
				<Button onClick={() => setShowSpamSubmissions(!showSpamSubmissions)}>
					{showSpamSubmissions
						? 'Hide Spam Submissions'
						: 'Show Spam Submissions'}
				</Button>
				<Button onClick={() => dispatch(updateEditFormModalOpen(true))}>
					Edit Form
				</Button>
				<Button
					variant='danger'
					onClick={() => {
						dispatch(updateSelectedForm(form))
						dispatch(updateDeleteFormModalOpen(true))
					}}
				>
					Delete Form
				</Button>
			</div>
		</dl>
	)
}

export default FormInfo
