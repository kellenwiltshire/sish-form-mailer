import { Button as HeadlessButton } from '@headlessui/react'
import clsx from 'clsx'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type ButtonProps = {
	children: ReactNode
	variant?: 'standard' | 'ghost' | 'danger'
} & ComponentPropsWithoutRef<typeof HeadlessButton>

const Button = ({ children, variant = 'standard', ...props }: ButtonProps) => {
	const getStyling = () => {
		switch (variant) {
			case 'danger':
				return 'inline-flex w-full cursor-pointer justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700/90 focus-visible:outline-2 focus-visible:outline-offset-2'
			case 'ghost':
				return 'inline-flex w-full cursor-pointer justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-text shadow-xs inset-ring-1 inset-ring-ring hover:bg-hover sm:col-start-1 sm:mt-0'
			case 'standard':
			default:
				return 'inline-flex w-full cursor-pointer justify-center rounded-md bg-[#4f46e5] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#4f46e5]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]'
		}
	}
	return (
		<HeadlessButton
			{...props}
			className={clsx(
				getStyling(),
				'disabled:bg-disabled min-w-full disabled:cursor-not-allowed',
			)}
		>
			{children}
		</HeadlessButton>
	)
}

export default Button
