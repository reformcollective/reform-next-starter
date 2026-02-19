"use server"

import { Form } from "@base-ui/react/form"

export interface FormState {
	serverErrors?: Form.Props["errors"]
	success?: boolean
	values?: Record<string, string>
}

export async function submitForm(
	_previousState: FormState,
	formData: FormData,
): Promise<FormState> {
	await new Promise((resolve) => setTimeout(resolve, 1000))

	// Preserve submitted values so uncontrolled inputs don't reset
	const values = { username: formData.get("username") as string }

	try {
		if (values.username === "admin") {
			return { values, serverErrors: { username: "'admin' is reserved for system use" } }
		}

		// 50% chance the username is taken
		const success = Math.random() > 0.5

		if (!success) {
			return { values, serverErrors: { username: `${values.username} is unavailable` } }
		}
	} catch {
		return { values, serverErrors: { username: "A server error has occurred" } }
	}

	return { success: true }
}
