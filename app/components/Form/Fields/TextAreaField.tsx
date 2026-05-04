"use client"

import { useState, type RefObject } from "react"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { css, f, styled } from "library/styled"
import { colors } from "app/styles/colors.css"

interface TextAreaFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the textarea. */
	label: string
	/** Marks the field as required, appends "*" to the label. */
	required?: boolean
	/** Disables the textarea and prevents interaction. */
	disabled?: boolean
	/** Placeholder text shown when the textarea is empty. */
	placeholder?: string
	/** HTML autocomplete hint (e.g. "street-address", "shipping address-line1"). */
	autoComplete?: string
	/** Minimum character length for the value to be valid. */
	minLength?: number
	/** Maximum character length for the value to be valid. */
	maxLength?: number
	/** Number of visible text rows. @default 4 */
	rows?: number
	/** Helper text displayed below the textarea. */
	hint?: string
	/**
	 * Custom validation function. Receives `(value, formValues)`.
	 * Return `null` if valid, or a string/string[] of error messages.
	 */
	validate?: FieldRoot.Props["validate"]
	/**
	 * When to run validation.
	 * - `"onSubmit"` — on form submit, re-validates on change after first failure.
	 * - `"onBlur"` — when the field loses focus.
	 * - `"onChange"` — on every change.
	 * @default "onSubmit"
	 */
	validationMode?: Form.ValidationMode
	/** Debounce time (ms) for the `validate` function when using `"onChange"`. @default 0 */
	validationDebounceTime?: number
	/** Ref exposing imperative actions like `validate()` for cross-field validation. */
	actionsRef?: RefObject<FieldRoot.Actions | null>
}

export function TextAreaField({
	name,
	label,
	required,
	disabled,
	placeholder,
	autoComplete,
	minLength,
	maxLength,
	rows = 4,
	hint,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: TextAreaFieldProps) {
	const [filled, setFilled] = useState(false)

	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<Label>
				{label}
				{required && " *"}
			</Label>
			<TextAreaWrapper>
				<Field.Control
					render={<Control rows={rows} onChange={(e) => setFilled(e.target.value !== "")} />}
					required={required}
					placeholder={placeholder}
					autoComplete={autoComplete}
					minLength={minLength}
					maxLength={maxLength}
				/>
				<Field.Validity>
					{({ validity }) => {
						if (validity.valid === null) return null
						if (validity.valid && !filled) return null
						return (
							<IconSlot>
								{validity.valid ? (
									<ValidIcon aria-hidden>✓</ValidIcon>
								) : (
									<ErrorIcon aria-hidden>✕</ErrorIcon>
								)}
							</IconSlot>
						)
					}}
				</Field.Validity>
			</TextAreaWrapper>
			{hint && <Description>{hint}</Description>}
			<Field.Error />
		</StyledFieldRoot>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const StyledFieldRoot = styled(Field.Root, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 6px;
	`),
])

const Label = styled(Field.Label, [
	f.responsive(css`
		color: ${colors.black};
	`),
])

const Description = styled(Field.Description, [
	f.responsive(css`
		color: #6b7280;
	`),
])

const TextAreaWrapper = styled("div", [
	f.responsive(css`
		position: relative;
		width: 100%;
	`),
])

const Control = styled("textarea", [
	f.responsive(css`
		box-sizing: border-box;
		padding: 12px;
		margin: 0;
		border: 1px solid #e5e7eb;
		width: 100%;
		border-radius: 8px;
		font-family: inherit;
		background-color: transparent;
		color: ${colors.black};
		max-width: 100%;
		overflow-wrap: anywhere;

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

const IconSlot = styled("span", [
	f.responsive(css`
		position: absolute;
		right: 12px;
		top: 16px;
		display: flex;
		align-items: center;
		pointer-events: none;
		font-size: 14px;
		line-height: 1;
	`),
])

const ValidIcon = styled("span", [
	f.responsive(css`
		color: #15803d;
	`),
])

const ErrorIcon = styled("span", [
	f.responsive(css`
		color: ${colors.red};
	`),
])
