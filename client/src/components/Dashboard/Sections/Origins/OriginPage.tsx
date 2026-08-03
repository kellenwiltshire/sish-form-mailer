import Button from '@/components/UI/Button'
import { useAppDispatch } from '@/redux/hooks'
import { updateAddOriginModalOpen } from '@/redux/modalSlice/modalSlice'
import PageLayout from '@/Layout/PageLayout'
import OriginsTable from './OriginsTable'

const OriginsPage = () => {
	const dispatch = useAppDispatch()

	return (
		<PageLayout
			title='Allowed Origins'
			button={
				<Button onClick={() => dispatch(updateAddOriginModalOpen(true))}>
					Add Origin
				</Button>
			}
		>
			<OriginsTable />
		</PageLayout>
	)
}

export default OriginsPage
