"use client"

import { Checkbox } from "@base-ui/react/checkbox"
import { CheckboxGroup } from "@base-ui/react/checkbox-group"
import { Field } from "@base-ui/react/field"
import { Fieldset } from "@base-ui/react/fieldset"
import { Form } from "@base-ui/react/form"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { Button } from "@base-ui/react/button"
import { useState } from "react"
import { css, f, styled } from "library/styled/alpha"

const NEEDS = ["Branding", "Web Design", "Development", "SEO", "Content Strategy"]

async function submitForm(url: string) {
	// Mimic a server response
	await new Promise((resolve) => setTimeout(resolve, 1000))

	try {
		const parsed = new URL(url)
		if (parsed.hostname.endsWith("example.com")) {
			return { error: "The example domain is not allowed" }
		}
	} catch {
		return { error: "This is not a valid URL" }
	}

	return { success: true }
}

export default function ExampleForm() {
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [needs, setNeeds] = useState<string[]>([])

	return (
		<Wrapper>
			<Card>
				<Heading>Get in touch</Heading>
				<Description>Fill out the form below and we'll get back to you shortly.</Description>
				<RequiredNote>* indicates a required field</RequiredNote>
				{success ? (
					<SuccessMessage>Thanks! We'll be in touch soon.</SuccessMessage>
				) : (
					<StyledForm
						onSubmit={async (e) => {
							e.preventDefault()
							const formData = new FormData(e.currentTarget)
							const url = formData.get("url") as string

							setErrors({})
							setLoading(true)
							const response = await submitForm(url)
							if (response.error) {
								setErrors({ url: response.error })
							} else {
								setSuccess(true)
							}
							setLoading(false)
						}}
					>
						<StyledFieldRoot name="name">
							<StyledLabel>Full name *</StyledLabel>
							<StyledInput type="text" required placeholder="Jane Smith" autoComplete="name" />
							<StyledError match="valueMissing">Please enter your name</StyledError>
						</StyledFieldRoot>

						<StyledFieldRoot name="email">
							<StyledLabel>Email *</StyledLabel>
							<StyledInput
								type="email"
								required
								placeholder="jane@company.com"
								autoComplete="email"
								pattern=".+@.+\..+"
							/>
							<StyledError match="valueMissing">Please enter your email</StyledError>
							<StyledError match="patternMismatch">Please enter a valid email</StyledError>
						</StyledFieldRoot>

						<StyledFieldRoot name="url">
							<StyledLabel>Homepage *</StyledLabel>
							<StyledInput
								type="url"
								required
								placeholder="https://example.com"
								pattern="https?://.*"
							/>
							<StyledError match="valueMissing">Please enter a URL</StyledError>
							<StyledError match="typeMismatch">Please enter a valid URL</StyledError>
							<StyledError match="patternMismatch">
								URL must start with http:// or https://
							</StyledError>
							{errors.url && <ServerError>{errors.url}</ServerError>}
						</StyledFieldRoot>

						{/* Radio group */}
						<Field.Root name="role">
							<Fieldset.Root render={<StyledRadioGroup required />}>
								<Fieldset.Legend render={<StyledLegend />}>Role *</Fieldset.Legend>
								{["Designer", "Developer", "Manager"].map((role) => (
									<RadioLabel key={role}>
										<StyledRadio value={role}>
											<StyledRadioIndicator />
										</StyledRadio>
										{role}
									</RadioLabel>
								))}
							</Fieldset.Root>
							<StyledError match="valueMissing">Please select a role</StyledError>
						</Field.Root>

						{/* Checkbox group — at least 2 required */}
						<Field.Root
							name="needs"
							validate={() => (needs.length >= 2 ? null : "Please select at least 2 needs")}
						>
							<Fieldset.Root
								render={<StyledCheckboxGroup value={needs} onValueChange={setNeeds} />}
							>
								<Fieldset.Legend render={<StyledLegend />}>
									What do you need help with? *
								</Fieldset.Legend>
								<Hint>Select at least 2</Hint>
								{NEEDS.map((need) => (
									<RadioLabel key={need}>
										<StyledCheckbox value={need}>
											<StyledCheckboxIndicator>✓</StyledCheckboxIndicator>
										</StyledCheckbox>
										{need}
									</RadioLabel>
								))}
							</Fieldset.Root>
							{/* Hidden control mirrors checkbox group value so Field.Root can validate */}
							<Field.Control type="hidden" name="needs" value={needs.join(",")} readOnly />
							<StyledError match="customError">Please select at least 2 needs</StyledError>
						</Field.Root>

						{/* Checkbox */}
						<Field.Root name="terms">
							<CheckboxLabel>
								<StyledCheckbox required>
									<StyledCheckboxIndicator>✓</StyledCheckboxIndicator>
								</StyledCheckbox>
								I agree to the terms and conditions *
							</CheckboxLabel>
							<StyledError match="valueMissing">You must agree to the terms</StyledError>
						</Field.Root>

						<StyledButton type="submit" disabled={loading} focusableWhenDisabled>
							{loading ? "Submitting..." : "Submit"}
						</StyledButton>
					</StyledForm>
				)}
			</Card>
		</Wrapper>
	)
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const Wrapper = styled("div", [
	f.responsive(css`
		grid-area: content;
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
		background-color: #f9fafb;
	`),
])

const Card = styled("div", [
	f.responsive(css`
		width: 100%;
		max-width: 24rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	`),
])

const Heading = styled("h1", [
	f.responsive(css`
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	`),
])

const Description = styled("p", [
	f.responsive(css`
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	`),
])

const RequiredNote = styled("p", [
	f.responsive(css`
		font-size: 0.75rem;
		color: #9ca3af;
		margin: 0;
	`),
])

const SuccessMessage = styled("p", [
	f.responsive(css`
		font-size: 0.875rem;
		color: #15803d;
		margin: 0;
	`),
])

// ─── Form ────────────────────────────────────────────────────────────────────

const StyledForm = styled(Form, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 30px;
	`),
])

const StyledFieldRoot = styled(Field.Root, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 0.25rem;
	`),
])

const StyledLabel = styled(Field.Label, [
	f.responsive(css`
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 500;
		color: #111827;
	`),
])

const Hint = styled("p", [
	f.responsive(css`
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
	`),
])

const StyledInput = styled(Field.Control, [
	f.responsive(css`
		box-sizing: border-box;
		padding: 0 0.875rem;
		margin: 0;
		border: 1px solid #e5e7eb;
		width: 100%;
		height: 2.5rem;
		border-radius: 0.375rem;
		font-family: inherit;
		font-size: 1rem;
		background-color: transparent;
		color: #111827;
		
		&::placeholder {
			color: #9ca3af;
		}
		
		&:focus {
			outline: 2px solid #3b82f6;
			outline-offset: -1px;
		}
		
		[data-invalid] & {
			border-color: #991b1b;
		}
	`),
])

const StyledError = styled(Field.Error, [
	f.responsive(css`
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #991b1b;
	`),
])

const ServerError = styled("p", [
	f.responsive(css`
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #991b1b;
		margin: 0;
	`),
])

// ─── Radio ───────────────────────────────────────────────────────────────────

const StyledRadioGroup = styled(RadioGroup, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: none;
		margin: 0;
		padding: 0;
	`),
])

const StyledLegend = styled("legend", [
	f.responsive(css`
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 500;
		color: #111827;
		padding: 0;
		margin-bottom: 0.25rem;
	`),
])

const RadioLabel = styled("label", [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #111827;
		cursor: pointer;
	`),
])

const StyledRadio = styled(Radio.Root, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 50%;
		border: 1px solid #d1d5db;
		background: white;
		cursor: pointer;
		flex-shrink: 0;
		
		&:focus-visible {
			outline: 2px solid #3b82f6;
			outline-offset: 2px;
		}
		
		&[data-checked] {
			border-color: #3b82f6;
		}
	`),
])

const StyledRadioIndicator = styled(Radio.Indicator, [
	f.responsive(css`
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #3b82f6;
	`),
])

// ─── Checkbox group ──────────────────────────────────────────────────────────

const StyledCheckboxGroup = styled(CheckboxGroup, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: none;
		margin: 0;
		padding: 0;
	`),
])

// ─── Checkbox ────────────────────────────────────────────────────────────────

const CheckboxLabel = styled(Field.Label, [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #111827;
		cursor: pointer;
	`),
])

const StyledCheckbox = styled(Checkbox.Root, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 0.25rem;
		border: 1px solid #d1d5db;
		background: white;
		cursor: pointer;
		flex-shrink: 0;
		
		&:focus-visible {
			outline: 2px solid #3b82f6;
			outline-offset: 2px;
		}
		
		&[data-checked] {
			background: #3b82f6;
			border-color: #3b82f6;
		}
	`),
])

const StyledCheckboxIndicator = styled(Checkbox.Indicator, [
	f.responsive(css`
		font-size: 0.75rem;
		line-height: 1;
		color: white;
	`),
])

// ─── Submit ──────────────────────────────────────────────────────────────────

const StyledButton = styled(Button, [
	f.responsive(css`
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2.5rem;
		padding: 0 0.875rem;
		margin: 0;
		outline: 0;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background-color: #f9fafb;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.5rem;
		color: #111827;
		
		@media (hover: hover) {
			&:hover:not([data-disabled]) {
				background-color: #f3f4f6;
			}
		}
		
		&:focus-visible {
			outline: 2px solid #3b82f6;
			outline-offset: -1px;
		}
		
		&:active:not([data-disabled]) {
			background-color: #e5e7eb;
			box-shadow: inset 0 1px 3px #e5e7eb;
			border-top-color: #d1d5db;
		}
		
		&[data-disabled] {
			color: #6b7280;
		}
	`),
])
