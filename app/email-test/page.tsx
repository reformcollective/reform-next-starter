"use client"

import { Field } from "@base-ui/react/field"
import { Form } from "@base-ui/react/form"
import { Button } from "@base-ui/react/button"
import { useState } from "react"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"

async function submitForm(value: string) {
	await new Promise((resolve) => setTimeout(resolve, 1000))

	try {
		const url = new URL(value)
		if (url.hostname.endsWith("example.com")) {
			return { error: "The example domain is not allowed" }
		}
	} catch {
		return { error: "This is not a valid URL" }
	}

	return { success: true }
}

export default function EmailTest() {
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [loading, setLoading] = useState(false)

	return (
		<Wrapper>
			<Card>
				<h1>URL Field Test</h1>
				<Form
					onSubmit={async (event) => {
						event.preventDefault()
						const formData = new FormData(event.currentTarget)
						const value = formData.get("url") as string

						setErrors({})
						setLoading(true)
						const response = await submitForm(value)
						if (response.error) {
							setErrors({ url: response.error })
						}
						setLoading(false)
					}}
					style={{ display: "flex", flexDirection: "column", gap: 24 }}
				>
					<Field.Root name="url" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<StyledLabel>Homepage</StyledLabel>
						<StyledInput
							type="url"
							required
							defaultValue="https://example.com"
							placeholder="https://example.com"
							pattern="https?://.*"
						/>
						<Field.Error match="valueMissing" style={{ color: colors.red }}>
							Please enter a URL
						</Field.Error>
						<Field.Error match="typeMismatch" style={{ color: colors.red }}>
							Please enter a valid URL
						</Field.Error>
						<Field.Error match="patternMismatch" style={{ color: colors.red }}>
							URL must start with http:// or https://
						</Field.Error>
						{errors.url && <p style={{ color: colors.red, margin: 0 }}>{errors.url}</p>}
					</Field.Root>
					<StyledButton type="submit" disabled={loading} focusableWhenDisabled>
						{loading ? "Submitting..." : "Submit"}
					</StyledButton>
				</Form>
			</Card>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-area: content;
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80px 24px;
		background-color: #f9fafb;
	`),
])

const Card = styled("div", [
	f.responsive(css`
		width: 100%;
		max-width: 480px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		padding: 40px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	`),
])

const StyledLabel = styled(Field.Label, [
	f.responsive(css`
		color: ${colors.black};
		font-weight: 500;
	`),
])

const StyledInput = styled(Field.Control, [
	f.responsive(css`
		box-sizing: border-box;
		padding: 0 16px;
		margin: 0;
		border: 1px solid #e5e7eb;
		width: 100%;
		height: 48px;
		border-radius: 8px;
		font-family: inherit;
		background-color: transparent;
		color: ${colors.black};

		&::placeholder {
			color: #9ca3af;
		}

		&:focus {
			outline: 2px solid ${colors.blue};
			outline-offset: -1px;
		}

		[data-invalid] & {
			border-color: ${colors.red};
		}
	`),
])

const StyledButton = styled(Button, [
	f.responsive(css`
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 44px;
		padding: 0 20px;
		margin: 0;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background-color: ${colors.black};
		font-family: inherit;
		font-size: 16px;
		font-weight: 500;
		color: white;
		cursor: pointer;

		@media (hover: hover) {
			&:hover:not([data-disabled]) {
				opacity: 0.9;
			}
		}

		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}

		&[data-disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}
	`),
])
