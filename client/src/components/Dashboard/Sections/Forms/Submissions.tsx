import type { Form } from '@/types/Form/Form'
import { fetcher } from '@/util/SWR/fetch'
import useSWR from 'swr'
import FormInfo from './FormInfo'
import SubmissionsTable from './SubmissionsTable'

type FormResponse = {
	form: Form
}

type SubmissionsProps = {
	formId: string
}

const Submissions = ({ formId }: SubmissionsProps) => {
	const { data: formData, error: formError } = useSWR<FormResponse, Error>(
		`/api/forms/${formId}`,
		fetcher,
	)

	if (!formData) return <div>Loading...</div>

	if (formError) return <div>error</div>

	const { form } = formData

	return (
		<div className='flex flex-col gap-4 divide-y divide-gray-200'>
			<FormInfo form={form} />
			<div className='flex flex-col gap-4'>
				<SubmissionsTable formId={formId} />
			</div>
		</div>
	)
}

export default Submissions
