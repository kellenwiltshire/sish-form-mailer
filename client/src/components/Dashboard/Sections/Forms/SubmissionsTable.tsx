import type { Submission } from '@/types/Submission/Submission'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { fetcher } from '@/util/SWR/fetch'
import useSWR from 'swr'
import { classNames } from '@/util/Classnames/Classnames'

type SubmissionResponse = {
	submissions: Submission[]
}

type SubmissionsTableProps = {
	formId: string
	showSpamSubmissions: boolean
}

const SubmissionsTable = ({
	formId,
	showSpamSubmissions,
}: SubmissionsTableProps) => {
	const [confirmation, setConfirmation] = useState<number | null>(null)

	const {
		data: formSubmissions,
		error: submissionsError,
		mutate,
	} = useSWR<SubmissionResponse, Error>(
		`/api/forms/${formId}/responses`,
		fetcher,
	)

	if (!formSubmissions) return <div>Loading...</div>

	if (submissionsError) return <div>error</div>

	const { submissions } = formSubmissions

	if (!submissions) return <div>No Entries</div>

	const maxEntryObj = submissions.reduce((max, obj) => {
		return Object.keys(JSON.parse(obj.payload)).length >
			Object.keys(JSON.parse(max.payload)).length
			? obj
			: max
	})

	const firstPayload = JSON.parse(maxEntryObj.payload) as Record<
		string,
		unknown
	>
	const headers = Object.keys(firstPayload)

	const spamSubmissions = submissions.filter(
		(submission) => submission.status === 'spam',
	)
	const filteredSubmission = submissions.filter(
		(submission) => submission.status !== 'spam',
	)

	const handleDeleteResponse = (id: number) => {
		fetch(`/api/forms/${formId}/responses/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('Submission Deleted')
				mutate()
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
	}

	return (
		<table className='relative min-w-full divide-y divide-gray-300'>
			<thead>
				<tr>
					{headers.map((head) => (
						<th
							key={head}
							scope='col'
							className='py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900'
						>
							{head}
						</th>
					))}
					<th
						scope='col'
						className='py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900'
					>
						Status
					</th>
					<th
						scope='col'
						className='py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900'
					>
						Error Reason
					</th>
					<th scope='col' className='py-3.5 pr-4 pl-3'>
						<span className='sr-only'>Delete</span>
					</th>
				</tr>
			</thead>
			<tbody className='divide-y divide-gray-200'>
				{showSpamSubmissions
					? spamSubmissions.map((submission) => {
							const payload = JSON.parse(submission.payload) as Record<
								string,
								unknown
							>
							return (
								<tr key={submission.id}>
									{headers.map((h) => (
										<td
											key={h}
											className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'
										>
											{String(payload[h] ?? '')}
										</td>
									))}
									<td
										className={classNames(
											'px-3 py-4 text-sm whitespace-nowrap text-gray-500',
										)}
									>
										<div
											className={classNames(
												'rounded-full',
												submission.status === 'error'
													? 'bg-red-500'
													: submission.status === 'received'
														? 'bg-yellow-300'
														: 'bg-green-600',
											)}
										>
											{submission.status}
										</div>
									</td>
									<td className='max-w-3xs px-3 py-4 text-sm text-wrap text-gray-500'>
										{submission.error_reason}
									</td>
									<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
										{confirmation === submission.id ? (
											<button
												onClick={() => handleDeleteResponse(submission.id)}
												className='cursor-pointer text-red-600 hover:text-red-900'
											>
												Are you sure?
												<span className='sr-only'>, {submission.id}</span>
											</button>
										) : (
											<button
												onClick={() => setConfirmation(submission.id)}
												className='cursor-pointer text-red-600 hover:text-red-900'
											>
												Delete
											</button>
										)}
									</td>
								</tr>
							)
						})
					: filteredSubmission.map((submission) => {
							const payload = JSON.parse(submission.payload) as Record<
								string,
								unknown
							>
							return (
								<tr key={submission.id}>
									{headers.map((h) => (
										<td
											key={h}
											className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'
										>
											{String(payload[h] ?? '')}
										</td>
									))}
									<td
										className={classNames(
											'rounded px-3 py-4 text-sm whitespace-nowrap text-gray-500',
											submission.status === 'error'
												? 'bg-red-500'
												: submission.status === 'received'
													? 'bg-yellow-500'
													: 'bg-green-700',
										)}
									>
										{submission.status}
									</td>
									<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
										{submission.error_reason}
									</td>
									<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
										{confirmation === submission.id ? (
											<button
												onClick={() => handleDeleteResponse(submission.id)}
												className='cursor-pointer text-red-600 hover:text-red-900'
											>
												Are you sure?
												<span className='sr-only'>, {submission.id}</span>
											</button>
										) : (
											<button
												onClick={() => setConfirmation(submission.id)}
												className='cursor-pointer text-red-600 hover:text-red-900'
											>
												Delete
											</button>
										)}
									</td>
								</tr>
							)
						})}
			</tbody>
		</table>
	)
}

export default SubmissionsTable
