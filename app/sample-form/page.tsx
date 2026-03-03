"use client"

import { useRef, useState, type FormEvent } from "react"
import type { FieldRoot } from "@base-ui/react/field"
import { css, f, styled } from "library/styled/alpha"
import { Form } from "@base-ui/react/form"
import { Button } from "@base-ui/react/button"
import { colors } from "app/styles/colors.css"
import ClientOnly from "library/ClientOnly"
import {
	CheckboxField,
	CheckboxGroupField,
	ComboboxField,
	InputField,
	NumberField,
	RadioGroupField,
	SelectField,
	SliderField,
	SwitchField,
	TextAreaField,
} from "app/components/Form/Fields"

const COUNTRIES_TO_VISIT = [
	"Argentina",
	"Australia",
	"Brazil",
	"Canada",
	"Chile",
	"China",
	"Colombia",
	"Croatia",
	"Czech Republic",
	"Denmark",
	"Egypt",
	"Finland",
	"France",
	"Germany",
	"Greece",
	"Iceland",
	"India",
	"Indonesia",
	"Ireland",
	"Italy",
	"Japan",
	"Kenya",
	"Mexico",
	"Morocco",
	"Netherlands",
	"New Zealand",
	"Norway",
	"Peru",
	"Poland",
	"Portugal",
	"Singapore",
	"South Africa",
	"South Korea",
	"Spain",
	"Sweden",
	"Switzerland",
	"Thailand",
	"Turkey",
	"United Kingdom",
	"United States",
	"Vietnam",
]

const FIELD_LABELS: Record<string, string> = {
	firstName: "First Name",
	favoriteColor: "Favorite Color (checkboxes)",
	preferredColor: "Favorite Color (select)",
	dietaryPreference: "Dietary Preference",
	email: "Email",
	vowelTest: "Vowel Test",
	website: "Website",
	password: "Password",
	confirmPassword: "Confirm Password",
	about: "About You",
	capital: "Capital City",
	countriesToVisit: "Countries to Visit",
	newsletter: "Newsletter",
	darkMode: "Dark Mode",
	quantity: "Quantity",
	budget: "Budget ($k)",
	priceRange: "Price Range ($k)",
}

const MASKED_FIELDS = new Set(["password", "confirmPassword"])

type ValidationMode = "onSubmit" | "onBlur" | "onChange"

export default function SampleForm() {
	const [validationMode, setValidationMode] = useState<ValidationMode>("onSubmit")
	const [submittedData, setSubmittedData] = useState<Record<string, string | string[]> | null>(null)
	const confirmPasswordRef = useRef<FieldRoot.Actions | null>(null)

	const vowelidate = (value: unknown) => {
		const isEmpty = value === undefined || value === null || value === ""
		if (isEmpty) return "We need to know your vowels!"
		const hasVowel = /[aeiouAEIOU]/.test(String(value))
		return hasVowel ? null : "Must contain at least one vowel"
	}

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const data: Record<string, string | string[]> = {}
		const keys = [...new Set(formData.keys())]
		for (const key of keys) {
			const values = formData.getAll(key) as string[]
			data[key] = values.length === 1 ? values[0]! : values
		}
		setSubmittedData(data)
	}

	return (
		<ClientOnly>
			<Wrapper>
				<Card>
					{submittedData ? (
						<Results data={submittedData} onReset={() => setSubmittedData(null)} />
					) : (
						<>
							<ControlPanel>
								<ControlGroup>
									<ControlLabel>Validation</ControlLabel>
									<SegmentedGroup>
										{(["onSubmit", "onBlur", "onChange"] as const).map((mode) => (
											<SegmentedButton
												key={mode}
												data-active={validationMode === mode || undefined}
											>
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

							<StyledForm
								key={validationMode}
								validationMode={validationMode}
								onSubmit={handleSubmit}
							>
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
								<CheckboxGroupField
									name="favoriteColor"
									label="Favorite Color"
									items={[
										{ value: "red", label: "Red" },
										{ value: "green", label: "Green" },
										{ value: "blue", label: "Blue" },
									]}
									required
									hint="Select your favorite color"
								/>
								<RadioGroupField
									name="dietaryPreference"
									label="Dietary Preference"
									items={[
										{ value: "vegetarian", label: "Vegetarian" },
										{ value: "vegan", label: "Vegan" },
										{ value: "pescatarian", label: "Pescatarian" },
										{ value: "omnivore", label: "Omnivore" },
									]}
									required
									hint="Select your dietary preference"
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
									hint="Must be between 10 and 200 characters."
									minLength={10}
									maxLength={200}
								/>
								<SelectField
									name="preferredColor"
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
								<ComboboxField
									name="capital"
									label="Capital City"
									required
									placeholder="Search capitals..."
									items={[
										"Berlin",
										"Madrid",
										"Paris",
										"Rome",
										"Lisbon",
										"Athens",
										"Vienna",
										"Warsaw",
										"Prague",
										"Amsterdam",
									]}
								/>
								<ComboboxField
									multiple
									name="countriesToVisit"
									label="Countries to Visit"
									items={COUNTRIES_TO_VISIT}
									required
									placeholder="Search countries..."
									hint="Select all the countries you'd like to visit."
								/>
								<CheckboxField name="newsletter" label="Subscribe to newsletter" />
								<SwitchField name="darkMode" label="Enable dark mode" defaultChecked />
								<NumberField
									name="quantity"
									label="Quantity"
									required
									defaultValue={1}
									min={1}
									max={100}
								/>
								<SliderField
									name="budget"
									label="Budget ($k)"
									min={0}
									max={200}
									step={5}
									defaultValue={50}
								/>
								<SliderField
									range
									name="priceRange"
									label="Price Range ($k)"
									min={0}
									max={200}
									step={5}
									defaultValue={[25, 100]}
								/>
								<StyledButton type="submit">Submit</StyledButton>
							</StyledForm>
						</>
					)}
				</Card>
			</Wrapper>
		</ClientOnly>
	)
}

// ─── Results ──────────────────────────────────────────────────────────────────

function Results({
	data,
	onReset,
}: {
	data: Record<string, string | string[]>
	onReset: () => void
}) {
	return (
		<ResultsWrapper>
			<ResultsHeading>Submitted</ResultsHeading>
			<ResultsList>
				{Object.entries(data).map(([key, value]) => {
					const label = FIELD_LABELS[key] ?? key
					const display = MASKED_FIELDS.has(key)
						? "••••••••"
						: Array.isArray(value)
							? value.join(", ") || "—"
							: value || "—"
					return (
						<ResultsRow key={key}>
							<ResultsLabel>{label}</ResultsLabel>
							<ResultsValue>{display}</ResultsValue>
						</ResultsRow>
					)
				})}
			</ResultsList>
			<StyledButton type="button" onClick={onReset}>
				Start Over
			</StyledButton>
		</ResultsWrapper>
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

// ─── Submit / Reset ───────────────────────────────────────────────────────────

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

// ─── Results view ─────────────────────────────────────────────────────────────

const ResultsWrapper = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 0;
	`),
])

const ResultsHeading = styled("h2", [
	f.responsive(css`
		margin: 0 0 20px;
		font-size: 18px;
		font-weight: 600;
		color: ${colors.black};
	`),
])

const ResultsList = styled("dl", [
	f.responsive(css`
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	`),
])

const ResultsRow = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 16px;
		padding: 10px 14px;
		border-bottom: 1px solid #f3f4f6;
		
		&:last-child {
			border-bottom: none;
		}
		
		&:nth-child(even) {
			background: #f9fafb;
		}
	`),
])

const ResultsLabel = styled("dt", [
	f.responsive(css`
		flex-shrink: 0;
		width: 140px;
		font-size: 13px;
		font-weight: 600;
		color: #6b7280;
	`),
])

const ResultsValue = styled("dd", [
	f.responsive(css`
		margin: 0;
		font-size: 13px;
		color: ${colors.black};
		overflow-wrap: anywhere;
	`),
])
