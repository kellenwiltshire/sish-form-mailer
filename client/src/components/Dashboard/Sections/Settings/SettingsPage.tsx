import Button from '@/components/UI/Button'
import { useState } from 'react'
import DisplayUserSettings from './DisplayUserSettings'
import PageLayout from '@/Layout/PageLayout'
import UpdateUserSettings from './UpdateUserSettings'

const SettingsPage = () => {
	const [updateSettingsOpen, setUpdateSettingsOpen] = useState(false)

	return (
		<PageLayout
			title='User Settings'
			button={
				<Button onClick={() => setUpdateSettingsOpen((p) => !p)}>
					{updateSettingsOpen ? 'Cancel' : 'Update Settings'}
				</Button>
			}
		>
			{!updateSettingsOpen ? (
				<DisplayUserSettings />
			) : (
				<UpdateUserSettings setUpdateSettingsOpen={setUpdateSettingsOpen} />
			)}
		</PageLayout>
	)
}

export default SettingsPage
