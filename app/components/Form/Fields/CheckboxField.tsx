"use client"

import { type RefObject } from "react"
import { Checkbox } from "@base-ui/react/checkbox"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"

interface CheckboxFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed next to the checkbox. */
	label: string
	/** Marks the field as required — must be checked to submit. */
	required?: boolean
	/** Disables the checkbox and prevents interaction. */
	disabled?: boolean
	/** Helper text displayed below the checkbox. */
	hint?: string
	/** Initial checked state for an uncontrolled checkbox. */
	defaultChecked?: boolean
	/** Controlled checked state. */
	checked?: boolean
	/** Callback fired when the checked state changes. */
	onCheckedChange?: (checked: boolean) => void
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

export function CheckboxField({
	name,
	label,
	required,
	disabled,
	hint,
	defaultChecked,
	checked,
	onCheckedChange,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: CheckboxFieldProps) {
	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<CheckboxLabel>
				<CheckboxControl
					required={required}
					defaultChecked={defaultChecked}
					checked={checked}
					onCheckedChange={onCheckedChange ? (c) => onCheckedChange(c) : undefined}
				>
					<Indicator>✓</Indicator>
				</CheckboxControl>
				{label}
				{required && " *"}
			</CheckboxLabel>
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

const CheckboxControl = styled(Checkbox.Root, [
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

const Indicator = styled(Checkbox.Indicator, [
	f.responsive(css`
		font-size: 12px;
		line-height: 1;
		color: white;
	`),
])

const Description = styled(Field.Description, [
	f.responsive(css`
		color: #6b7280;
	`),
])
