import type { Form } from '@/types/Form/Form'
import { fetcher } from '@/util/SWR/fetch'
import useSWR from 'swr'
import FormInfo from './FormInfo'
import SubmissionsTable from './SubmissionsTable'
import { useState } from 'react'

type FormResponse = {
	form: Form
}

type SubmissionsProps = {
	formId: string
}

const Submissions = ({ formId }: SubmissionsProps) => {
	const [showSpamSubmissions, setShowSpamSubmissions] = useState(false)
	const { data: formData, error: formError } = useSWR<FormResponse, Error>(
		`/api/forms/${formId}`,
		fetcher,
	)

	if (!formData) return <div>Loading...</div>

	if (formError) return <div>error</div>

	const { form } = formData

	if (!form) {
		return null
	}
	return (
		<div className='flex flex-col gap-4 divide-y divide-gray-200'>
			{form && (
				<FormInfo
					form={form}
					showSpamSubmissions={showSpamSubmissions}
					setShowSpamSubmissions={setShowSpamSubmissions}
				/>
			)}
			<div className='flex flex-col gap-4 overflow-scroll'>
				<SubmissionsTable
					formId={formId}
					showSpamSubmissions={showSpamSubmissions}
				/>
			</div>
		</div>
	)
}

export default Submissions
