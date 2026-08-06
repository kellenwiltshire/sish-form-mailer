import useSWR from 'swr'
import { type Email } from '@/types/Email/Email'
import { fetcher } from '@/util/SWR/fetch'
import DisplayEmailSettings from './DisplayEmailSettings'
import Button from '@/components/UI/Button'
import { useState } from 'react'
import UpdateEmailSettings from './UpdateEmailSettings'
import PageLayout from '@/Layout/PageLayout'
import { toast } from 'react-toastify'

type EmailResponse = {
	smtp: Email | null
}

const EmailPage = () => {
	const [updateSettingsOpen, setUpdateSettingsOpen] = useState(false)
	const { data, error, mutate } = useSWR<EmailResponse, Error>(
		'/api/email-settings',
		fetcher,
	)

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const handleDeleteSMTP = () => {
		fetch(`/api/email-settings`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('Email Settings Deleted')
				mutate()
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
	}

	const { smtp } = data

	return (
		<PageLayout
			title='SMTP Settings'
			button={
				smtp ? (
					<div className='flex flex-row justify-end gap-3'>
						<Button variant='ghost' onClick={() => handleDeleteSMTP()}>
							Delete
						</Button>
						<Button onClick={() => setUpdateSettingsOpen((p) => !p)}>
							{updateSettingsOpen ? 'Cancel' : 'Update Settings'}
						</Button>
					</div>
				) : null
			}
		>
			{smtp && !updateSettingsOpen ? (
				<DisplayEmailSettings smtp={smtp} />
			) : (
				<div className='mt-5 divide-y divide-gray-900/10 px-4'>
					<h3 className='text-2xl'>
						{smtp ? 'Update Email Settings' : 'Add Email Settings'}
					</h3>
					<UpdateEmailSettings
						smtp={smtp}
						setUpdateSettingsOpen={setUpdateSettingsOpen}
					/>
				</div>
			)}
		</PageLayout>
	)
}

export default EmailPage
