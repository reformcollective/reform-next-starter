"use client"

import { Checkbox } from "@base-ui/react/checkbox"
import { CheckboxGroup } from "@base-ui/react/checkbox-group"
import { Field } from "@base-ui/react/field"
import { Fieldset } from "@base-ui/react/fieldset"
import { Form } from "@base-ui/react/form"
import { NumberField } from "@base-ui/react/number-field"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { Slider } from "@base-ui/react/slider"
import { Switch } from "@base-ui/react/switch"
import { Button } from "@base-ui/react/button"
import { useState } from "react"
import { css, f, styled } from "library/styled/alpha"
import textStyles from "app/styles/text"
import { colors } from "app/styles/colors.css"

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

						{/* Textarea with min character count */}
						<StyledFieldRoot name="message">
							<StyledLabel>Message *</StyledLabel>
							<Field.Control
								render={<StyledTextarea rows={4} />}
								required
								minLength={20}
								placeholder="Tell us about your project..."
							/>
							<Field.Description render={<Hint />}>
								Must be at least 20 characters
							</Field.Description>
							<StyledError match="valueMissing">Please enter a message</StyledError>
							<StyledError match="tooShort">Message must be at least 20 characters</StyledError>
						</StyledFieldRoot>

						{/* Radio group */}
						<StyledFieldRoot name="role">
							<Fieldset.Root render={<StyledRadioGroup required />}>
								<Fieldset.Legend render={<StyledLegend />}>Role *</Fieldset.Legend>
								{["Designer", "Developer", "Manager"].map((role) => (
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
						</StyledFieldRoot>

						{/* Checkbox group — at least 2 required */}
						<StyledFieldRoot
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
						</StyledFieldRoot>

						{/* Range slider */}
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
										<Slider.Thumb index={0} render={<StyledSliderThumb />} />
										<Slider.Thumb index={1} render={<StyledSliderThumb />} />
									</Slider.Track>
								</Slider.Control>
							</Fieldset.Root>
						</StyledFieldRoot>

						{/* Toggle / Switch */}
						<StyledFieldRoot name="newsletter">
							<SwitchLabel>
								Subscribe to newsletter{""}
								<StyledSwitch defaultChecked>
									<StyledSwitchThumb />
								</StyledSwitch>
							</SwitchLabel>
						</StyledFieldRoot>

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
		gap: 36px;
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

const ServerError = styled("p", [
	f.responsive(css`
		color: ${colors.red};
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

const StyledSliderThumb = styled("div", [
	f.responsive(css`
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		border: 2px solid ${colors.blue};
		cursor: pointer;
		transform: translateX(-50%);
		
		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}
	`),
])

// ─── Switch ──────────────────────────────────────────────────────────────────

const SwitchLabel = styled(Field.Label, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 500;
		color: ${colors.black};
		cursor: pointer;
	`),
])

const StyledSwitch = styled(Switch.Root, [
	f.responsive(css`
		position: relative;
		width: 44px;
		height: 24px;
		border-radius: 12px;
		border: none;
		background: #d1d5db;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
		transition: background 0.15s;
		
		&[data-checked] {
			background: #3b82f6;
		}
		
		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}
	`),
])

const StyledSwitchThumb = styled(Switch.Thumb, [
	f.responsive(css`
		position: absolute;
		top: 50%;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
		transition: transform 0.15s;
		transform: translateY(-50%) translateX(3px);
		
		[data-checked] & {
			transform: translateY(-50%) translateX(22px);
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
		overflow: hidden;
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
