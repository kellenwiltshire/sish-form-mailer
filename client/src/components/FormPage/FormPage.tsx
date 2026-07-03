import { useParams } from 'react-router'
import useSWR from 'swr'
import { fetcher } from '../../util/SWR/fetch'
import type { Form } from '../../types/Form/Form'
import type { Submission } from '../../types/Submission/Submission'

type FormResponse = {
	form: Form
}

type SubmissionResponse = {
	submissions: Submission[]
}

const FormPage = () => {
	const params = useParams()
	const formId = params.id

	const { data: formData, error: formError } = useSWR<FormResponse, Error>(
		`/api/forms/${formId}`,
		fetcher,
	)

	const { data: formSubmissions, error: submissionsError } = useSWR<
		SubmissionResponse,
		Error
	>(`/api/forms/${formId}/responses`, fetcher)

	if (!formData || !formSubmissions) return <div>Loading...</div>

	if (formError || submissionsError) return <div>error</div>

	const { form } = formData
	const { submissions } = formSubmissions

	console.log(submissions)

	return (
		<div className='flex flex-col gap-4'>
			<div>Form Page</div>
			<div>
				<p>{form.id}</p>
				<p>{form.name}</p>
				<p>{form.user_id}</p>
				<p>{form.create_at}</p>
				<p>{form.target_email}</p>
			</div>
			<div className='flex flex-col gap-4'>
				Submissions:
				{submissions.map((submission) => {
					return (
						<div>
							<p>{submission.id}</p>
							<p>{submission.form_id}</p>
							<p>{submission.payload}</p>
							<p>{submission.status}</p>
							<p>{submission.submitted_at}</p>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default FormPage
