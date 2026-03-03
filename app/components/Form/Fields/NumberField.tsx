"use client"

import { type RefObject } from "react"
import { NumberField as BaseNumberField } from "@base-ui/react/number-field"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"

interface NumberFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the number input. */
	label: string
	/** Marks the field as required, appends "*" to the label. */
	required?: boolean
	/** Disables the number field and prevents interaction. */
	disabled?: boolean
	/** Helper text displayed below the number field. */
	hint?: string
	/** Initial value for an uncontrolled field. */
	defaultValue?: number
	/** Controlled value. */
	value?: number
	/** Minimum allowed value. */
	min?: number
	/** Maximum allowed value. */
	max?: number
	/** Step increment for the +/− buttons. @default 1 */
	step?: number
	/** Callback fired when the value changes. */
	onValueChange?: (value: number) => void
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

export function NumberField({
	name,
	label,
	required,
	disabled,
	hint,
	defaultValue,
	value,
	min,
	max,
	step,
	onValueChange,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: NumberFieldProps) {
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
			<BaseNumberField.Root
				required={required}
				defaultValue={defaultValue}
				value={value}
				min={min}
				max={max}
				step={step}
				onValueChange={onValueChange}
			>
				<Group>
					<Decrement>−</Decrement>
					<NumberInput />
					<Increment>+</Increment>
				</Group>
			</BaseNumberField.Root>
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

const Group = styled(BaseNumberField.Group, [
	f.responsive(css`
		display: flex;
		align-items: center;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		width: fit-content;
	`),
])

const NumberInput = styled(BaseNumberField.Input, [
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

const buttonStyles = [
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

const Decrement = styled(BaseNumberField.Decrement, buttonStyles)
const Increment = styled(BaseNumberField.Increment, buttonStyles)
