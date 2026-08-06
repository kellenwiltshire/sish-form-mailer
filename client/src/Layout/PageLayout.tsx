import { classNames } from '@/util/Classnames/Classnames'
import type { JSX } from 'react/jsx-runtime'

type PageLayoutProps = {
	title: string
	button: JSX.Element | null
	children: JSX.Element
	topMargin?: boolean
}

const PageLayout = ({
	title,
	button,
	children,
	topMargin = true,
}: PageLayoutProps) => {
	return (
		<main className='min-h-screen w-full'>
			<header className='flex flex-row items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
				<h1 className='text-base/7 font-semibold text-gray-900'>{title}</h1>
				<div>{button}</div>
			</header>
			<div
				className={classNames(
					'flex flex-col justify-center',
					topMargin ? 'mt-24' : '',
				)}
			>
				{children}
			</div>
		</main>
	)
}

export default PageLayout
