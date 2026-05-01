"use client"

import { useRef, type RefObject } from "react"
import { Checkbox } from "@base-ui/react/checkbox"
import { CheckboxGroup } from "@base-ui/react/checkbox-group"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { Fieldset } from "@base-ui/react/fieldset"
import { css, f, styled } from "library/styled"
import { colors } from "app/styles/colors.css"

interface Option {
	value: string | null
	label: string
}

interface CheckboxGroupFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the checkbox group as a legend. */
	label: string
	/** The list of checkbox options to display. */
	items: Option[]
	/** Marks the field as required — at least one item must be selected. */
	required?: boolean
	/** Disables all checkboxes and prevents interaction. */
	disabled?: boolean
	/** Helper text displayed below the checkbox group. */
	hint?: string
	/** The controlled selected values. */
	value?: string[]
	/** The default selected values (uncontrolled). */
	defaultValue?: string[]
	/** Callback fired when the selected values change. */
	onValueChange?: (value: string[]) => void
	/**
	 * Custom validation function. Receives `(value, formValues)`.
	 * Return `null` if valid, or a string/string[] of error messages.
	 * When provided, overrides the built-in `required` validation.
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

export function CheckboxGroupField({
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
}: CheckboxGroupFieldProps) {
	// Track the current value in a ref so the validate function can close over it.
	// CheckboxGroup doesn't expose value via the Field.Root validate parameter,
	// so validation must close over external state (same pattern as sample-form).
	const valueRef = useRef<string[]>(value ?? defaultValue ?? [])

	const handleValueChange = (newValue: string[]) => {
		valueRef.current = newValue
		onValueChange?.(newValue)
	}

	const effectiveValidate: FieldRoot.Props["validate"] =
		validate ??
		(required ? () => (valueRef.current.length > 0 ? null : "This is a required field") : undefined)

	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={effectiveValidate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<Fieldset.Root
				render={
					<Group
						value={value}
						defaultValue={defaultValue ?? []}
						onValueChange={handleValueChange}
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
							<CheckboxControl value={itemValue ?? undefined}>
								<Indicator>✓</Indicator>
							</CheckboxControl>
							{itemLabel}
						</ItemLabel>
					</Field.Item>
				))}
			</Fieldset.Root>
			{hint && <Description>{hint}</Description>}
			<Field.Validity>
				{({ validity, error }) =>
					validity.customError ? <Field.Error>{error}</Field.Error> : null
				}
			</Field.Validity>
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

const Group = styled(CheckboxGroup, [
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
