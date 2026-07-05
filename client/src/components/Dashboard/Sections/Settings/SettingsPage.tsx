import Button from '@/components/UI/Button'
import { useState } from 'react'
import DisplayUserSettings from './DisplayUserSettings'

const SettingsPage = () => {
	const [updateSettingsOpen, setUpdateSettingsOpen] = useState(false)

	return (
		<main>
			<header className='flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
				<h1 className='text-base/7 font-semibold text-gray-900'>
					User Settings
				</h1>
				<div>
					<Button onClick={() => setUpdateSettingsOpen((p) => !p)}>
						{updateSettingsOpen ? 'Cancel' : 'Update Settings'}
					</Button>
				</div>
			</header>
			<div className='flex min-h-full flex-col justify-center'>
				{!updateSettingsOpen ? <DisplayUserSettings /> : <></>}
			</div>
		</main>
	)
}

export default SettingsPage
