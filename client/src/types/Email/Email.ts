export const Encryption = {
	tls: 'TLS',
	starttls: 'STARTTLS',
} as const

export type Encryption = (typeof Encryption)[keyof typeof Encryption]

export type Email = {
	encryption_type: Encryption
	host: string
	id: number
	port: number
	recipient_email: string
	sender_email: string
	updated_at: string
	user_id: number
	username: string
	password?: string
}
