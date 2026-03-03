"use client"

import { type RefObject } from "react"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { Fieldset } from "@base-ui/react/fieldset"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"

interface Option {
	value: string | null
	label: string
}

interface RadioGroupFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the radio group as a legend. */
	label: string
	/** The list of radio options to display. */
	items: Option[]
	/** Marks the field as required — one item must be selected. */
	required?: boolean
	/** Disables all radios and prevents interaction. */
	disabled?: boolean
	/** Helper text displayed below the radio group. */
	hint?: string
	/** The controlled selected value. */
	value?: string
	/** The default selected value (uncontrolled). */
	defaultValue?: string
	/** Callback fired when the selected value changes. */
	onValueChange?: (value: string) => void
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

export function RadioGroupField({
	name,
	label,
	items,
	required,
	disabled,
	hint,
	value,
	defaultValue,
	onValueChange,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: RadioGroupFieldProps) {
	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<Fieldset.Root
				render={
					<Group
						required={required}
						value={value}
						defaultValue={defaultValue}
						onValueChange={onValueChange}
					/>
				}
			>
				<Fieldset.Legend render={<Legend />}>
					{label}
					{required && " *"}
				</Fieldset.Legend>
				{items.map(({ value: itemValue, label: itemLabel }) => (
					<Field.Item key={itemValue}>
						<ItemLabel>
							<RadioControl value={itemValue ?? undefined}>
								<Indicator />
							</RadioControl>
							{itemLabel}
						</ItemLabel>
					</Field.Item>
				))}
			</Fieldset.Root>
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

const Group = styled(RadioGroup, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		border: none;
	`),
])

const Legend = styled("legend", [
	f.responsive(css`
		color: ${colors.black};
		margin-bottom: 6px;
	`),
])

const Description = styled(Field.Description, [
	f.responsive(css`
		color: #6b7280;
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

const RadioControl = styled(Radio.Root, [
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

const Indicator = styled(Radio.Indicator, [
	f.responsive(css`
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: ${colors.blue};
	`),
])
