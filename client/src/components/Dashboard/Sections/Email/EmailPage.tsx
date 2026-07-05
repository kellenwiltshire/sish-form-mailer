import useSWR from 'swr'
import { type Email } from '@/types/Email/Email'
import { fetcher } from '@/util/SWR/fetch'
import DisplayEmailSettings from './DisplayEmailSettings'
import Button from '@/components/UI/Button'
import { useState } from 'react'
import UpdateEmailSettings from './UpdateEmailSettings'

type EmailResponse = {
	smtp: Email | null
}

const EmailPage = () => {
	const [updateSettingsOpen, setUpdateSettingsOpen] = useState(false)
	const { data, error } = useSWR<EmailResponse, Error>(
		'/api/email-settings',
		fetcher,
	)

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const { smtp } = data

	return (
		<main>
			<header className='flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
				<h1 className='text-base/7 font-semibold text-gray-900'>
					SMTP Settings
				</h1>
				{smtp && (
					<div>
						<Button onClick={() => setUpdateSettingsOpen((p) => !p)}>
							{updateSettingsOpen ? 'Cancel' : 'Update Settings'}
						</Button>
					</div>
				)}
			</header>
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
		</main>
	)
}

export default EmailPage
