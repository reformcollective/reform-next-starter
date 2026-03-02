"use client"

import { useRef, useState } from "react"
import type { FieldRoot } from "@base-ui/react/field"
import { css, f, styled } from "library/styled/alpha"
import { Form } from "@base-ui/react/form"
import { Button } from "@base-ui/react/button"
import { colors } from "app/styles/colors.css"
import ClientOnly from "library/ClientOnly"
import { InputField } from "app/components/Form/Fields/InputField"
import { TextAreaField } from "app/components/Form/Fields/TextAreaField"
import { SelectField } from "app/components/Form/Fields/SelectField"

type ValidationMode = "onSubmit" | "onBlur" | "onChange"

export default function TextFieldForm() {
	const [validationMode, setValidationMode] = useState<ValidationMode>("onSubmit")
	const confirmPasswordRef = useRef<FieldRoot.Actions | null>(null)

	const vowelidate = (value: unknown) => {
		const isEmpty = value === undefined || value === null || value === ""
		if (isEmpty) return "Fill it out, dude" // Don't validate empty values, let "required" handle that
		const hasVowel = /[aeiouAEIOU]/.test(String(value))
		return hasVowel ? null : "Must contain at least one vowel"
	}

	return (
		<ClientOnly>
			<Wrapper>
				<Card>
					<ControlPanel>
						<ControlGroup>
							<ControlLabel>Validation</ControlLabel>
							<SegmentedGroup>
								{(["onSubmit", "onBlur", "onChange"] as const).map((mode) => (
									<SegmentedButton key={mode} data-active={validationMode === mode || undefined}>
										<HiddenRadio
											type="radio"
											name="validationMode"
											value={mode}
											checked={validationMode === mode}
											onChange={() => setValidationMode(mode)}
										/>
										{mode}
									</SegmentedButton>
								))}
							</SegmentedGroup>
						</ControlGroup>
					</ControlPanel>

					<StyledForm key={validationMode} validationMode={validationMode}>
						<InputField
							name="firstName"
							label="First Name"
							type="text"
							required
							placeholder="Enter your first name"
							autoComplete="name"
							hint="Your first name"
							minLength={6}
							maxLength={10}
						/>
						<InputField
							name="email"
							label="Email"
							type="email"
							required
							placeholder="Enter your email"
							autoComplete="email"
							hint="We'll never share your email."
						/>
						<InputField
							name="vowelTest"
							label="Vowel Test"
							type="text"
							placeholder="Must contain at least one vowel"
							validate={vowelidate}
							hint="The letter 'Y' does not count as a vowel here."
							minLength={6}
							maxLength={20}
						/>
						<InputField
							name="website"
							label="Website"
							type="url"
							placeholder="https://example.com"
							autoComplete="url"
							pattern="https?://.+"
							hint="Must be a valid URL starting with http:// or https://"
						/>
						<InputField
							name="password"
							label="Password"
							type="password"
							required
							placeholder="Enter a password"
							autoComplete="new-password"
							hint="Must be at least 8 characters."
							pattern=".{8,}"
							validationMode="onChange"
							validate={() => {
								confirmPasswordRef.current?.validate()
								return null
							}}
						/>
						<InputField
							name="confirmPassword"
							label="Confirm Password"
							type="password"
							required
							placeholder="Confirm your password"
							autoComplete="new-password"
							hint="Must match the password field."
							actionsRef={confirmPasswordRef}
							validate={(value, formValues) =>
								value === formValues.password ? null : "Passwords do not match"
							}
							validationMode="onChange"
						/>
						<TextAreaField
							name="about"
							label="About You"
							required
							placeholder="Tell us about yourself"
							hint="This field is optional, but if filled out must be between 10 and 200 characters."
							minLength={10}
							maxLength={200}
						/>
						<SelectField
							name="favoriteColor"
							label="Favorite Color"
							placeholder="Select your favorite color"
							hint="This field is optional."
							alignItemWithTrigger={false}
							items={[
								{ value: null, label: "None" },
								{ value: "red", label: "Red" },
								{ value: "green", label: "Green" },
								{ value: "blue", label: "Blue" },
							]}
						/>

						<StyledButton type="submit">Submit</StyledButton>
					</StyledForm>
				</Card>
			</Wrapper>
		</ClientOnly>
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

const StyledForm = styled(Form, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 24px;
	`),
])

// ─── Control panel ───────────────────────────────────────────────────────────

const ControlPanel = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		background: #f3f4f6;
		border-radius: 8px;
		border: 1px dashed #d1d5db;
	`),
])

const ControlGroup = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	`),
])

const ControlLabel = styled("span", [
	f.responsive(css`
		font-weight: 600;
		font-size: 13px;
		color: #374151;
		min-width: 110px;
	`),
])

const SegmentedGroup = styled("div", [
	f.responsive(css`
		display: flex;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		overflow: hidden;
	`),
])

const SegmentedButton = styled("label", [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		background: white;
		cursor: pointer;
		border-right: 1px solid #d1d5db;
		transition: background 100ms, color 100ms;

		&:last-child {
			border-right: none;
		}

		@media (hover: hover) {
			&:hover {
				background: #f9fafb;
			}
		}

		&[data-active] {
			background: ${colors.black};
			color: white;
		}
	`),
])

const HiddenRadio = styled("input", [
	f.responsive(css`
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	`),
])

// ─── Submit ──────────────────────────────────────────────────────────────────

const StyledButton = styled(Button, [
	f.responsive(css`
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding: 0 14px;
		margin: 0;
		outline: 0;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background-color: #f9fafb;
		font-family: inherit;
		font-size: 16px;
		font-weight: 500;
		line-height: 24px;
		margin-top: 24px;
		color: ${colors.black};

		@media (hover: hover) {
			&:hover:not([data-disabled]) {
				background-color: #f3f4f6;
			}
		}

		&:focus-visible {
			outline: 2px solid ${colors.blue};
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
