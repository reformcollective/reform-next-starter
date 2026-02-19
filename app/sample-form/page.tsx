"use client"

import { Checkbox } from "@base-ui/react/checkbox"
import { CheckboxGroup } from "@base-ui/react/checkbox-group"
import { Field } from "@base-ui/react/field"
import { Fieldset } from "@base-ui/react/fieldset"
import { Form } from "@base-ui/react/form"
import { NumberField } from "@base-ui/react/number-field"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { Combobox } from "@base-ui/react/combobox"
import { Select } from "@base-ui/react/select"
import { Slider } from "@base-ui/react/slider"
import { Switch } from "@base-ui/react/switch"
import { Button } from "@base-ui/react/button"
import { useState } from "react"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"
import { NEEDS, INDUSTRIES, ROLES, COUNTRIES, SKILLS } from "./data"

const DISPOSABLE_DOMAINS = [
	"test.com",
	"mailinator.com",
	"tempmail.com",
	"throwaway.email",
	"guerrillamail.com",
]

async function submitForm(data: { url: string; email: string }) {
	// Mimic a server response
	await new Promise((resolve) => setTimeout(resolve, 1000))

	const errors: Record<string, string> = {}

	// Validate URL
	try {
		const parsed = new URL(data.url)
		if (parsed.hostname.endsWith("example.com")) {
			errors.url = "The example domain is not allowed"
		}
	} catch {
		errors.url = "This is not a valid URL"
	}

	// Validate email domain
	const emailDomain = data.email.split("@")[1]?.toLowerCase()
	if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
		errors.email = "Disposable email addresses are not allowed"
	}

	if (Object.keys(errors).length > 0) {
		return { errors }
	}

	return { success: true }
}

// Experiment with useActionState (see /action-test for working example):
// - Uses `action` prop on <Form> instead of `onSubmit` with e.preventDefault()
// - Uncontrolled inputs reset to `defaultValue` after each server action re-render,
//   so the server action must return submitted values and feed them back as defaultValue
// - <Form errors={state.serverErrors}> works with a single catch-all <Field.Error />,
//   but NOT with match-based Field.Errors — a formError causes ALL of them to render
// - Main benefit is progressive enhancement (forms work without JS)
// - For most cases, onSubmit is simpler: DOM values persist naturally, no round-tripping

export default function ExampleForm() {
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [submittedData, setSubmittedData] = useState<Record<string, string>>({})
	const [needs, setNeeds] = useState<string[]>([])
	const [skills, setSkills] = useState<string[]>([])

	return (
		<Wrapper>
			<Card>
				{success ? (
					<>
						<SuccessMessage>Thanks! We'll be in touch soon.</SuccessMessage>
						<pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#6b7280" }}>
							{JSON.stringify(submittedData, null, 2)}
						</pre>
					</>
				) : (
					<>
						<Heading>Get in touch</Heading>
						<Description>Fill out the form below and we'll get back to you shortly.</Description>
						<RequiredNote>* indicates a required field</RequiredNote>
						<StyledForm
							onSubmit={async (e) => {
								e.preventDefault()
								const formData = new FormData(e.currentTarget)
								console.log("Form submission:", {
									...Object.fromEntries(formData.entries()),
									needs,
									skills,
									budget: formData.getAll("budget"),
								})

								setErrors({})
								setLoading(true)
								const response = await submitForm({
									url: formData.get("url") as string,
									email: formData.get("email") as string,
								})
								if (response.errors) {
									setErrors(response.errors)
								} else {
									setSubmittedData({
										...(Object.fromEntries(formData.entries()) as Record<string, string>),
										needs: needs.join(", "), // multi-select checkboxes return multiple values with the same name "Design, Development"
										skills: skills.join(", "), // multi-select combobox returns multiple values with the same name "React, Vue, Angular"
										budget: formData.getAll("budget").join(" – "), // range slider returns multiple values with the same name "20 - 40"
									})
									setSuccess(true)
								}
								setLoading(false)
							}}
						>
							{/* Unstyled base-ui field structure for reference:
						<Field.Root name="fieldName">
							<Field.Label>Label</Field.Label>
							<Field.Control required placeholder="..." />
							<Field.Description>Helper text</Field.Description>
							<Field.Error match="valueMissing">Required</Field.Error>
							<Field.Error match="typeMismatch">Invalid</Field.Error>
						</Field.Root>
						*/}
							<StyledFieldRoot name="name">
								<StyledLabel>Full name *</StyledLabel>
								<StyledInput type="text" required placeholder="Jane Smith" autoComplete="name" />
								<StyledError match="valueMissing">Please enter your name</StyledError>
							</StyledFieldRoot>

							{/* Unstyled email field with validation for reference:
						<Field.Root name="email">
							<Field.Label>Email *</Field.Label>
							<Field.Control
								type="email"
								required
								placeholder="jane@company.com"
								autoComplete="email"
								pattern=".+@.+\..+"
							/>
							<Field.Error match="valueMissing">Required</Field.Error>
							<Field.Error match="typeMismatch">Invalid email</Field.Error>
							<Field.Error match="patternMismatch">Must include @ and domain</Field.Error>
							{errors.email && <p>{errors.email}</p>}
						</Field.Root>

						Note: Server-side errors can't use <Form errors={}> with match-based
						Field.Errors — a formError causes ALL Field.Error components to render.
						Instead, handle server errors manually with a conditional.
						*/}
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
								{errors.email && <StyledServerError>{errors.email}</StyledServerError>}
							</StyledFieldRoot>

							{/* Unstyled URL field with validation for reference:
						<Field.Root name="url">
							<Field.Label>Homepage *</Field.Label>
							<Field.Control
								type="url"
								required
								placeholder="https://example.com"
								pattern="https?://.*"
							/>
							<Field.Error match="valueMissing">Required</Field.Error>
							<Field.Error match="typeMismatch">Invalid URL</Field.Error>
							<Field.Error match="patternMismatch">URL must start with http:// or https://</Field.Error>
						</Field.Root>

						Note: Server-side errors can't use <Form errors={}> with match-based
						Field.Errors — a formError causes ALL Field.Error components to render.
						Instead, handle server errors manually with a conditional:
						{errors.fieldName && <p>{errors.fieldName}</p>}
						*/}
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
								{errors.url && <StyledServerError>{errors.url}</StyledServerError>}
							</StyledFieldRoot>

							{/* Unstyled textarea with min/max character count for reference:
						<Field.Root name="message">
							<Field.Label>Message</Field.Label>
							<Field.Control render={<textarea rows={4} />} required minLength={20} maxLength={100} placeholder="..." />
							<Field.Description>Must be at least 20 characters</Field.Description>
							<Field.Error match="valueMissing">Required</Field.Error>
							<Field.Error match="tooShort">Too short</Field.Error>
							<Field.Error match="tooLong">Too long</Field.Error>
						</Field.Root>
						*/}
							<StyledFieldRoot name="message">
								<StyledLabel>Message *</StyledLabel>
								<Field.Control
									render={<StyledTextarea rows={4} />}
									required
									minLength={20}
									maxLength={100}
									placeholder="Tell us about your project..."
								/>
								<Field.Description render={<Hint />}>
									Must be at least 20 characters
								</Field.Description>
								<StyledError match="valueMissing">Please enter a message</StyledError>
								<StyledError match="tooShort">Message must be at least 20 characters</StyledError>
								<StyledError match="tooLong">Message must be less than 100 characters</StyledError>
							</StyledFieldRoot>

							{/* Unstyled select for reference:
						<Field.Root name="industry">
							<Field.Label nativeLabel={false} render={<div />}>Industry</Field.Label>
							<Select.Root required items={INDUSTRIES}>
								<Select.Trigger>
									<Select.Value placeholder="Select..." />
									<Select.Icon>▾</Select.Icon>
								</Select.Trigger>
								<Select.Portal>
									<Select.Positioner sideOffset={8}>
										<Select.Popup>
											<Select.List>
												{INDUSTRIES.map(({ label, value }) => (
													<Select.Item key={value} value={value}>
														<Select.ItemIndicator>✓</Select.ItemIndicator>
														<Select.ItemText>{label}</Select.ItemText>
													</Select.Item>
												))}
											</Select.List>
										</Select.Popup>
									</Select.Positioner>
								</Select.Portal>
							</Select.Root>
							<Field.Error match="valueMissing">Required</Field.Error>
						</Field.Root>
						*/}
							<StyledFieldRoot name="industry">
								<Field.Label nativeLabel={false} render={<StyledLabelDiv />}>
									Industry *
								</Field.Label>
								<Select.Root required items={INDUSTRIES}>
									<StyledSelectTrigger>
										<Select.Value placeholder="Select an industry" />
										<Select.Icon render={<SelectChevron />}>▾</Select.Icon>
									</StyledSelectTrigger>
									<Select.Portal>
										<Select.Positioner sideOffset={8}>
											<StyledSelectPopup>
												<Select.List>
													{INDUSTRIES.map(({ label, value }) => (
														<StyledSelectItem key={value} value={value}>
															<Select.ItemIndicator render={<StyledItemIndicator />}>
																✓
															</Select.ItemIndicator>
															<Select.ItemText render={<StyledItemText />}>{label}</Select.ItemText>
														</StyledSelectItem>
													))}
												</Select.List>
											</StyledSelectPopup>
										</Select.Positioner>
									</Select.Portal>
								</Select.Root>
								<StyledError match="valueMissing">Please select an industry</StyledError>
							</StyledFieldRoot>

							{/* Unstyled combobox for reference:
						<Field.Root name="country">
							<Field.Label nativeLabel={false} render={<div />}>Country</Field.Label>
							<Combobox.Root required items={COUNTRIES}>
								<Combobox.Input placeholder="Search countries..." />
								<Combobox.Trigger>▾</Combobox.Trigger>
								<Combobox.Portal>
									<Combobox.Positioner sideOffset={0}>
										<Combobox.Popup>
											<Combobox.Empty>No results</Combobox.Empty>
											<Combobox.List>
												{(country) => (
													<Combobox.Item key={country} value={country}>
														<Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
														{country}
													</Combobox.Item>
												)}
											</Combobox.List>
										</Combobox.Popup>
									</Combobox.Positioner>
								</Combobox.Portal>
							</Combobox.Root>
							<Field.Error match="valueMissing">Required</Field.Error>
						</Field.Root>

						Note: Use a render function in Combobox.List (not .map()) so
						base-ui can filter items as the user types.
						*/}
							<StyledFieldRoot name="country">
								<Field.Label nativeLabel={false} render={<StyledLabelDiv />}>
									Country *
								</Field.Label>
								<Combobox.Root required items={COUNTRIES}>
									<StyledComboboxInputRow>
										<StyledComboboxInput placeholder="Search countries..." />
										<StyledComboboxTrigger>
											<Combobox.Icon render={<SelectChevron />}>▾</Combobox.Icon>
										</StyledComboboxTrigger>
									</StyledComboboxInputRow>
									<Combobox.Portal>
										<Combobox.Positioner sideOffset={4}>
											<StyledComboboxPopup>
												<StyledComboboxEmpty>No results</StyledComboboxEmpty>
												<StyledComboboxList>
													{(country) => (
														<StyledComboboxItem key={country} value={country}>
															<Combobox.ItemIndicator render={<StyledItemIndicator />}>
																✓
															</Combobox.ItemIndicator>
															<StyledItemText>{country}</StyledItemText>
														</StyledComboboxItem>
													)}
												</StyledComboboxList>
											</StyledComboboxPopup>
										</Combobox.Positioner>
									</Combobox.Portal>
								</Combobox.Root>
								<StyledError match="valueMissing">Please select a country</StyledError>
							</StyledFieldRoot>

							{/* Unstyled multi-select combobox for reference:
						<Field.Root name="skills" validate={() => skills.length > 0 ? null : "Please select at least one skill"}>
							<Field.Label nativeLabel={false} render={<div />}>Skills</Field.Label>
							<Combobox.Root multiple items={SKILLS} value={skills} onValueChange={setSkills}>
								<Combobox.Chips>
									{skills.map((skill) => (
										<Combobox.Chip key={skill}>
											{skill}
											<Combobox.ChipRemove>×</Combobox.ChipRemove>
										</Combobox.Chip>
									))}
								</Combobox.Chips>
								<Combobox.Input placeholder="Search skills..." />
								<Combobox.Trigger>▾</Combobox.Trigger>
								<Combobox.Portal>
									<Combobox.Positioner sideOffset={0}>
										<Combobox.Popup>
											<Combobox.Empty>No results</Combobox.Empty>
											<Combobox.List>
												{(skill) => (
													<Combobox.Item key={skill} value={skill}>
														<Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
														{skill}
													</Combobox.Item>
												)}
											</Combobox.List>
										</Combobox.Popup>
									</Combobox.Positioner>
								</Combobox.Portal>
							</Combobox.Root>
							<Field.Error match="customError">Please select at least one skill</Field.Error>
						</Field.Root>
						*/}
							<StyledFieldRoot
								name="skills"
								validate={() => (skills.length > 0 ? null : "Please select at least one skill")}
							>
								<Field.Label nativeLabel={false} render={<StyledLabelDiv />}>
									Skills *
								</Field.Label>
								<Combobox.Root multiple items={SKILLS} value={skills} onValueChange={setSkills}>
									<StyledMultiInputRow>
										<StyledComboboxChips>
											{skills.map((skill) => (
												<StyledComboboxChip key={skill}>
													{skill}
													<StyledChipRemove>×</StyledChipRemove>
												</StyledComboboxChip>
											))}
										</StyledComboboxChips>
										<StyledComboboxInput
											placeholder={skills.length === 0 ? "Search skills..." : ""}
										/>
										<StyledComboboxTrigger>
											<Combobox.Icon render={<SelectChevron />}>▾</Combobox.Icon>
										</StyledComboboxTrigger>
									</StyledMultiInputRow>
									<Combobox.Portal>
										<Combobox.Positioner sideOffset={0}>
											<StyledComboboxPopup>
												<StyledComboboxEmpty>No results</StyledComboboxEmpty>
												<StyledComboboxList>
													{(skill) => (
														<StyledComboboxItem key={skill} value={skill}>
															<Combobox.ItemIndicator render={<StyledItemIndicator />}>
																✓
															</Combobox.ItemIndicator>
															<StyledItemText>{skill}</StyledItemText>
														</StyledComboboxItem>
													)}
												</StyledComboboxList>
											</StyledComboboxPopup>
										</Combobox.Positioner>
									</Combobox.Portal>
								</Combobox.Root>
								<StyledError match="customError">Please select at least one skill</StyledError>
							</StyledFieldRoot>

							{/* Unstyled radio group for reference:
						<Field.Root name="role">
							<Fieldset.Root render={<RadioGroup required />}>
								<Fieldset.Legend>Role</Fieldset.Legend>
								{ROLES.map((role) => (
									<Field.Item key={role}>
										<Field.Label>
											<Radio.Root value={role}>
												<Radio.Indicator />
											</Radio.Root>
											{role}
										</Field.Label>
									</Field.Item>
								))}
							</Fieldset.Root>
							<Field.Error match="valueMissing">Required</Field.Error>
						</Field.Root>
						*/}
							{/* Radio group - https://base-ui.com/react/components/radio#form-integration */}
							<Field.Root name="role">
								<Fieldset.Root render={<StyledRadioGroup required />}>
									<StyledLegend>Role *</StyledLegend>
									{ROLES.map((role) => (
										<Field.Item key={role}>
											<ItemLabel>
												<StyledRadio value={role}>
													<StyledRadioIndicator />
												</StyledRadio>
												{role}
											</ItemLabel>
										</Field.Item>
									))}
								</Fieldset.Root>
								<StyledError match="valueMissing">Please select a role</StyledError>
							</Field.Root>

							{/* Unstyled checkbox group for reference:
						<Field.Root name="needs" validate={() => needs.length >= 2 ? null : "Please select at least 2 needs"}>
							<Fieldset.Root render={<CheckboxGroup value={needs} onValueChange={setNeeds} />}>
								<Fieldset.Legend>What do you need help with?</Fieldset.Legend>
								{NEEDS.map((need) => (
									<Field.Item key={need}>
										<Field.Label>
											<Checkbox.Root value={need}>
												<Checkbox.Indicator />
											</Checkbox.Root>
											{need}
										</Field.Label>
									</Field.Item>
								))}
							</Fieldset.Root>
							<Field.Error match="customError">Please select at least 2 needs</Field.Error>
						</Field.Root>
						*/}
							{/* Checkbox group — at least 2 required - https://base-ui.com/react/components/checkbox-group#form-integration */}
							<Field.Root
								name="needs"
								validate={() => (needs.length >= 2 ? null : "Please select at least 2 needs")}
							>
								<Fieldset.Root
									render={<StyledCheckboxGroup value={needs} onValueChange={setNeeds} />}
								>
									<StyledLegend>What do you need help with? *</StyledLegend>
									<Hint>Select at least 2</Hint>
									{NEEDS.map((need) => (
										<Field.Item key={need}>
											<ItemLabel>
												<StyledCheckbox value={need}>
													<StyledCheckboxIndicator>✓</StyledCheckboxIndicator>
												</StyledCheckbox>
												{need}
											</ItemLabel>
										</Field.Item>
									))}
								</Fieldset.Root>
								<StyledError match="customError">Please select at least 2 needs</StyledError>
							</Field.Root>

							{/* Unstyled range slider for reference:
						<Field.Root name="budget">
							<Fieldset.Root render={<Slider.Root defaultValue={[25, 75]} min={0} max={100} step={5} />}>
								<Fieldset.Legend>Budget range</Fieldset.Legend>
								<Slider.Value />
								<Slider.Control>
									<Slider.Track>
										<Slider.Indicator />
										<Slider.Thumb index={0} />
										<Slider.Thumb index={1} />
									</Slider.Track>
								</Slider.Control>
							</Fieldset.Root>
						</Field.Root>
						*/}
							{/* Range slider - https://base-ui.com/react/components/slider#form-integration */}
							<StyledFieldRoot name="budget">
								<Fieldset.Root
									render={<StyledSliderRoot defaultValue={[25, 75]} min={0} max={100} step={5} />}
								>
									<SliderHeader>
										<Fieldset.Legend render={<StyledLegend />}>Budget range ($k)</Fieldset.Legend>
										<Slider.Value render={<SliderValueText />} />
									</SliderHeader>
									<Slider.Control render={<StyledSliderControl />}>
										<Slider.Track render={<StyledSliderTrack />}>
											<Slider.Indicator render={<StyledSliderIndicator />} />
											<StyledSliderThumb index={0} />
											<StyledSliderThumb index={1} />
										</Slider.Track>
									</Slider.Control>
								</Fieldset.Root>
							</StyledFieldRoot>

							{/* Unstyled switch for reference:
						<Field.Root name="newsletter">
							<Field.Label>
								Subscribe to newsletter
								<Switch.Root>
									<Switch.Thumb />
								</Switch.Root>
							</Field.Label>
						</Field.Root>
						*/}
							{/* Toggle / Switch */}
							<StyledFieldRoot name="newsletter">
								<SwitchLabel>
									Subscribe to newsletter{""}
									<StyledSwitch defaultChecked>
										<StyledSwitchThumb />
									</StyledSwitch>
								</SwitchLabel>
							</StyledFieldRoot>

							{/* Unstyled number field for reference:
						<Field.Root name="teamSize">
							<Field.Label>Team size</Field.Label>
							<NumberField.Root defaultValue={1} min={1} max={50} required>
								<NumberField.Group>
									<NumberField.Decrement>−</NumberField.Decrement>
									<NumberField.Input />
									<NumberField.Increment>+</NumberField.Increment>
								</NumberField.Group>
							</NumberField.Root>
							<Field.Error match="valueMissing">Required</Field.Error>
						</Field.Root>
						*/}
							{/* Number field / Counter */}
							<StyledFieldRoot name="teamSize">
								<NumberField.Root defaultValue={1} min={1} max={50} required>
									<StyledLabel>Team size *</StyledLabel>
									<StyledNumberGroup>
										<StyledDecrement>−</StyledDecrement>
										<StyledNumberInput />
										<StyledIncrement>+</StyledIncrement>
									</StyledNumberGroup>
								</NumberField.Root>
								<StyledError match="valueMissing">Please enter team size</StyledError>
							</StyledFieldRoot>

							{/* Unstyled single checkbox for reference:
						<Field.Root name="terms">
							<Field.Label>
								<Checkbox.Root required>
									<Checkbox.Indicator />
								</Checkbox.Root>
								I agree to the terms and conditions
							</Field.Label>
							<Field.Error match="valueMissing">Required</Field.Error>
						</Field.Root>
						*/}
							{/* Checkbox */}
							<StyledFieldRoot name="terms">
								<CheckboxLabel>
									<StyledCheckbox required>
										<StyledCheckboxIndicator>✓</StyledCheckboxIndicator>
									</StyledCheckbox>
									I agree to the terms and conditions *
								</CheckboxLabel>
								<StyledError match="valueMissing">You must agree to the terms</StyledError>
							</StyledFieldRoot>

							<StyledButton type="submit" disabled={loading} focusableWhenDisabled>
								{loading ? "Submitting..." : "Submit"}
							</StyledButton>
						</StyledForm>
					</>
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

const Heading = styled("h1", [
	f.responsive(css`
		
	`),
])

const Description = styled("p", [
	f.responsive(css`
		color: #6b7280;
		margin: 0;
	`),
])

const RequiredNote = styled("p", [
	f.responsive(css`
		font-size: 14px;
		color: #9ca3af;
		margin: 0;
	`),
])

const SuccessMessage = styled("p", [
	f.responsive(css`
		color: #15803d;
		margin: 0;
	`),
])

const StyledForm = styled(Form, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 60px;
	`),
])

const StyledFieldRoot = styled(Field.Root, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 6px;
	`),
])

const StyledLabel = styled(Field.Label, [
	f.responsive(css`
		color: ${colors.black};
	`),
])

const Hint = styled("p", [
	f.responsive(css`
		color: #6b7280;
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

const StyledTextarea = styled("textarea", [
	f.responsive(css`
		box-sizing: border-box;
		padding: 12px;
		border: 1px solid #e5e7eb;
		width: 100%;
		border-radius: 8px;
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

const StyledError = styled(Field.Error, [
	f.responsive(css`
		color: ${colors.red};
	`),
])

const StyledServerError = styled("p", [
	f.responsive(css`
		color: ${colors.red};
		margin: 0;
	`),
])

// ─── Select ──────────────────────────────────────────────────────────────────

const StyledLabelDiv = styled("div", [
	f.responsive(css`
		color: ${colors.black};
		font-weight: 500;
	`),
])

const StyledSelectTrigger = styled(Select.Trigger, [
	f.responsive(css`
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		margin: 0;
		border: 1px solid #e5e7eb;
		width: 100%;
		height: 48px;
		border-radius: 8px;
		font-family: inherit;
		background-color: transparent;
		color: ${colors.black};
		cursor: pointer;

		@media (hover: hover) {
			&:hover {
				background-color: #f3f4f6;
			}
		}

		&[data-popup-open] {
			background-color: #f3f4f6;
		}

		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: -1px;
		}

		&[data-invalid] {
			border-color: ${colors.red};
		}

		&[data-placeholder] {
			color: #9ca3af;
		}
	`),
])

const SelectChevron = styled("span", [
	f.responsive(css`
		font-size: 18px;
		color: #6b7280;
	`),
])

const StyledSelectPopup = styled(Select.Popup, [
	f.responsive(css`
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 4px;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 10%),
			0 4px 6px -4px rgb(0 0 0 / 10%);
		width: var(--anchor-width);
		transform-origin: var(--transform-origin);
		transition:
			transform 150ms,
			opacity 150ms;
		
		&[data-starting-style],
		&[data-ending-style] {
			opacity: 0;
			transform: scale(0.9);
		}
		
		&[data-side="none"] {
			transition: none;
			transform: none;
			opacity: 1;
			min-width: calc(var(--anchor-width) + 1rem);
		}
	`),
])

const StyledSelectItem = styled(Select.Item, [
	f.responsive(css`
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 0.75rem 1fr;
		gap: 8px;
		align-items: center;
		padding: 8px 10px;
		cursor: default;
		color: ${colors.black};
		outline: none;

		&[data-highlighted] {
			z-index: 0;
			position: relative;
			color: white;
		}

		&[data-highlighted]::before {
			content: "";
			z-index: -1;
			position: absolute;
			inset-block: 0;
			inset-inline: 4px;
			border-radius: 4px;
			background-color: ${colors.black};
		}
	`),
])

const StyledItemIndicator = styled("span", [
	f.responsive(css`
		grid-column-start: 1;
		display: flex;
		align-items: center;
		font-size: 12px;
	`),
])

const StyledItemText = styled("span", [
	f.responsive(css`
		grid-column-start: 2;
	`),
])

// ─── Combobox ────────────────────────────────────────────────────────────────

const StyledComboboxInputRow = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		width: 100%;
		overflow: hidden;

		&:focus-within {
			outline: 2px solid ${colors.blue};
			outline-offset: -1px;
		}

		[data-invalid] & {
			border-color: ${colors.red};
		}
	`),
])

const StyledComboboxInput = styled(Combobox.Input, [
	f.responsive(css`
		flex: 1;
		box-sizing: border-box;
		padding: 0 16px;
		height: 48px;
		border: none;
		outline: none;
		font-family: inherit;
		background: transparent;
		color: ${colors.black};

		&::placeholder {
			color: #9ca3af;
		}
	`),
])

const StyledComboboxTrigger = styled(Combobox.Trigger, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 48px;
		border: none;
		background: transparent;
		cursor: pointer;
		flex-shrink: 0;
	`),
])

const StyledComboboxPopup = styled(Combobox.Popup, [
	f.responsive(css`
		box-sizing: border-box;
		background: white;
		border-radius: 6px;
		outline: 1px solid #e5e7eb;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 10%),
			0 4px 6px -4px rgb(0 0 0 / 10%);
		color: ${colors.black};
		width: var(--anchor-width);
		max-width: var(--available-width);
		transform-origin: var(--transform-origin);
		transition: opacity 100ms, transform 100ms;

		&[data-starting-style],
		&[data-ending-style] {
			opacity: 0;
			transform: scale(0.95);
		}
	`),
])

const StyledComboboxItem = styled(Combobox.Item, [
	f.responsive(css`
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 0.75rem 1fr;
		gap: 8px;
		align-items: center;
		padding-block: 8px;
		padding-left: 16px;
		padding-right: 32px;
		cursor: default;
		color: ${colors.black};
		outline: none;

		&[data-highlighted] {
			z-index: 0;
			position: relative;
			color: white;
		}

		&[data-highlighted]::before {
			content: "";
			z-index: -1;
			position: absolute;
			inset-block: 0;
			inset-inline: 8px;
			border-radius: 4px;
			background-color: ${colors.black};
		}
	`),
])

const StyledComboboxList = styled(Combobox.List, [
	f.responsive(css`
		box-sizing: border-box;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding-block: 8px;
		scroll-padding-block: 8px;
		outline: none;
		max-height: min(23rem, var(--available-height));
		
		&[data-empty] {
			padding: 0;
		}
	`),
])

const StyledComboboxEmpty = styled(Combobox.Empty, [
	f.responsive(css`
		&:not(:empty) {
			color: #9ca3af;
			line-height: 1rem;
			padding: 1rem;
		}
	`),
])

const StyledMultiInputRow = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		width: 100%;
		min-height: 48px;
		padding: 6px 6px 6px 12px;
		box-sizing: border-box;

		&:focus-within {
			outline: 2px solid ${colors.blue};
			outline-offset: -1px;
		}

		[data-invalid] & {
			border-color: ${colors.red};
		}
	`),
])

const StyledComboboxChips = styled(Combobox.Chips, [
	f.responsive(css`
		display: contents;
	`),
])

const StyledComboboxChip = styled(Combobox.Chip, [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px 6px 2px 10px;
		background: #e5e7eb;
		border-radius: 999px;
		font-size: 14px;
		color: ${colors.black};
		white-space: nowrap;
	`),
])

const StyledChipRemove = styled(Combobox.ChipRemove, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border: none;
		background: transparent;
		cursor: pointer;
		color: #6b7280;
		font-size: 16px;
		line-height: 1;
		padding: 0;

		&:hover {
			color: ${colors.black};
		}
	`),
])

// ─── Radio ───────────────────────────────────────────────────────────────────

const StyledRadioGroup = styled(RadioGroup, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		border: none;
	`),
])

const StyledLegend = styled("legend", [
	f.responsive(css`
		color: ${colors.black};
		margin-bottom: 6px;
	`),
])

const ItemLabel = styled(Field.Label, [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 10px;
		color: ${colors.black};
		cursor: pointer;
	`),
])

const StyledRadio = styled(Radio.Root, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1px solid #d1d5db;
		background: white;
		cursor: pointer;
		flex-shrink: 0;
		
		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}
		
		&[data-checked] {
			border-color: ${colors.blue};
		}
	`),
])

const StyledRadioIndicator = styled(Radio.Indicator, [
	f.responsive(css`
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: ${colors.blue};
	`),
])

const StyledCheckboxGroup = styled(CheckboxGroup, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
	`),
])

const CheckboxLabel = styled(Field.Label, [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 16px;
		color: ${colors.black};
		cursor: pointer;
	`),
])

const StyledCheckbox = styled(Checkbox.Root, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 4px;
		border: 1px solid #d1d5db;
		background: white;
		cursor: pointer;
		flex-shrink: 0;
		
		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}
		
		&[data-checked] {
			background: ${colors.blue};
			border-color: ${colors.blue};
		}
	`),
])

const StyledCheckboxIndicator = styled(Checkbox.Indicator, [
	f.responsive(css`
		font-size: 12px;
		line-height: 1;
		color: white;
	`),
])

// ─── Slider ──────────────────────────────────────────────────────────────────

const StyledSliderRoot = styled(Slider.Root, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		border: none;
		width: 100%;
	`),
])

const SliderHeader = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: space-between;
	`),
])

const SliderValueText = styled("span", [
	f.responsive(css`
		color: #6b7280;
	`),
])

const StyledSliderControl = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		height: 20px;
	`),
])

const StyledSliderTrack = styled("div", [
	f.responsive(css`
		position: relative;
		width: 100%;
		height: 4px;
		border-radius: 2px;
		background: #e5e7eb;
	`),
])

const StyledSliderIndicator = styled("div", [
	f.responsive(css`
		position: absolute;
		height: 100%;
		border-radius: 2px;
		background: ${colors.blue};
	`),
])

const StyledSliderThumb = styled(Slider.Thumb, [
	f.responsive(css`
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		border: 2px solid ${colors.blue};
		cursor: pointer;
		transform: translateX(-50%);

		&:has(:focus-visible) {
            outline: 2px solid ${colors.blue};
            outline-offset: 1px;
        }
	`),
])

// ─── Switch ──────────────────────────────────────────────────────────────────

const SwitchLabel = styled(Field.Label, [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 12px;
		font-weight: 500;
		color: ${colors.black};
		cursor: pointer;
	`),
])

const StyledSwitch = styled(Switch.Root, [
	f.responsive(css`
		display: flex;
		align-items: center;
		width: 44px;
		height: 24px;
		padding: 2px;
		box-sizing: border-box;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		background: linear-gradient(90deg, ${colors.blue} 35%, #d1d5db 65%);
		background-size: 200% 100%;
		background-position-x: 100%;
		transition: background-position-x 125ms ease;

		&[data-checked] {
			background-position-x: 0%;
		}

		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}
	`),
])

const StyledSwitchThumb = styled(Switch.Thumb, [
	f.responsive(css`
		aspect-ratio: 1 / 1;
		height: 100%;
		border-radius: 50%;
		background: white;
		box-shadow: 0 1px 2px rgb(0 0 0 / 20%);
		transition: translate 125ms ease;
		translate: 0 0;
		
		[data-checked] & {
			translate: 20px 0;
		}
	`),
])

// ─── Number field ────────────────────────────────────────────────────────────

const StyledNumberGroup = styled(NumberField.Group, [
	f.responsive(css`
		display: flex;
		align-items: center;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		width: fit-content;
	`),
])

const StyledNumberInput = styled(NumberField.Input, [
	f.responsive(css`
		box-sizing: border-box;
		width: 56px;
		height: 40px;
		border: none;
		border-left: 1px solid #e5e7eb;
		border-right: 1px solid #e5e7eb;
		text-align: center;
		font-family: inherit;
		font-size: 16px;
		color: ${colors.black};
		background: transparent;
        z-index: 10;
		
		&:focus {
			outline: 2px solid ${colors.blue};
			outline-offset: -1px;
		}
	`),
])

const numberButtonStyles = [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: #f9fafb;
		cursor: pointer;
		font-size: 18px;
		color: ${colors.black};
		
		@media (hover: hover) {
			&:hover {
				background: #f3f4f6;
			}
		}
		
		&:active {
			background: #e5e7eb;
		}
	`),
]

const StyledDecrement = styled(NumberField.Decrement, numberButtonStyles)
const StyledIncrement = styled(NumberField.Increment, numberButtonStyles)

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
