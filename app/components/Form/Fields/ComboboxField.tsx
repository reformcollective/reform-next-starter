"use client"

import { useRef, useState, type RefObject } from "react"
import { Combobox } from "@base-ui/react/combobox"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { css, f, styled } from "library/styled"
import { colors } from "app/styles/colors.css"

interface ComboboxFieldCommonProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the combobox. */
	label: string
	/** The list of options to search and select from. */
	items: string[]
	/** Marks the field as required, appends "*" to the label. */
	required?: boolean
	/** Disables the combobox and prevents interaction. */
	disabled?: boolean
	/** Placeholder text shown in the search input. */
	placeholder?: string
	/** Helper text displayed below the combobox. */
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

interface ComboboxFieldSingleProps extends ComboboxFieldCommonProps {
	multiple?: false
	/** The controlled selected value. */
	value?: string | null
	/** The default selected value (uncontrolled). */
	defaultValue?: string | null
	/** Callback fired when the selected value changes. */
	onValueChange?: (value: string | null) => void
}

interface ComboboxFieldMultipleProps extends ComboboxFieldCommonProps {
	multiple: true
	/** The controlled selected values. */
	value?: string[]
	/** The default selected values (uncontrolled). */
	defaultValue?: string[]
	/** Callback fired when the selected values change. */
	onValueChange?: (value: string[]) => void
}

type ComboboxFieldProps = ComboboxFieldSingleProps | ComboboxFieldMultipleProps

export function ComboboxField(props: ComboboxFieldProps) {
	const {
		name,
		label,
		items,
		required,
		disabled,
		placeholder,
		hint,
		validate,
		validationMode,
		validationDebounceTime,
		actionsRef,
	} = props

	const rowRef = useRef<HTMLDivElement>(null)

	// For multiple mode: track selected values for chip rendering and validation.
	// Initialize from defaultValue; controlled value (props.value) takes precedence when provided.
	const [internalMultiValue, setInternalMultiValue] = useState<string[]>(
		props.multiple ? (props.defaultValue ?? []) : [],
	)
	const currentMultiValue = props.multiple ? (props.value ?? internalMultiValue) : []

	const handleMultiValueChange = (newValue: string[]) => {
		setInternalMultiValue(newValue)
		if (props.multiple) props.onValueChange?.(newValue)
	}

	const effectiveValidate: FieldRoot.Props["validate"] =
		validate ??
		(props.multiple && required
			? () => (currentMultiValue.length > 0 ? null : "This is a required field")
			: undefined)

	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={effectiveValidate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<Field.Label nativeLabel={false} render={<Label />}>
				{label}
				{required && " *"}
			</Field.Label>

			{props.multiple ? (
				<Combobox.Root
					multiple
					items={items}
					value={currentMultiValue}
					onValueChange={handleMultiValueChange}
				>
					<MultiInputRow ref={rowRef}>
						<Chips>
							{currentMultiValue.map((item) => (
								<Chip key={item}>
									{item}
									<ChipRemove>×</ChipRemove>
								</Chip>
							))}
						</Chips>
						<MultiInput placeholder={currentMultiValue.length === 0 ? (placeholder ?? "") : ""} />
					</MultiInputRow>
					<Combobox.Portal>
						<Combobox.Positioner sideOffset={0} anchor={rowRef}>
							<Popup>
								<Empty>No results</Empty>
								<List>
									{(item: string) => (
										<Item key={item} value={item}>
											<Combobox.ItemIndicator render={<ItemIndicator />}>✓</Combobox.ItemIndicator>
											<ItemText>{item}</ItemText>
										</Item>
									)}
								</List>
							</Popup>
						</Combobox.Positioner>
					</Combobox.Portal>
				</Combobox.Root>
			) : (
				<Combobox.Root
					required={required}
					items={items}
					value={props.value}
					defaultValue={props.defaultValue}
					onValueChange={props.onValueChange}
				>
					<InputRow ref={rowRef}>
						<ComboboxInput placeholder={placeholder} />
						<ComboboxTrigger>
							<Combobox.Icon render={<Chevron />}>▾</Combobox.Icon>
						</ComboboxTrigger>
					</InputRow>
					<Combobox.Portal>
						<Combobox.Positioner sideOffset={4} anchor={rowRef}>
							<Popup>
								<Empty>No results</Empty>
								<List>
									{(item: string) => (
										<Item key={item} value={item}>
											<Combobox.ItemIndicator render={<ItemIndicator />}>✓</Combobox.ItemIndicator>
											<ItemText>{item}</ItemText>
										</Item>
									)}
								</List>
							</Popup>
						</Combobox.Positioner>
					</Combobox.Portal>
				</Combobox.Root>
			)}

			{hint && <Description>{hint}</Description>}
			{props.multiple ? (
				<Field.Validity>
					{({ validity, error }) =>
						validity.customError ? <Field.Error>{error}</Field.Error> : null
					}
				</Field.Validity>
			) : (
				<Field.Error />
			)}
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

const Label = styled("div", [
	f.responsive(css`
		color: ${colors.black};
	`),
])

const Description = styled(Field.Description, [
	f.responsive(css`
		color: #6b7280;
	`),
])

// ─── Single input row ─────────────────────────────────────────────────────────

const InputRow = styled("div", [
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

// ─── Multiple input row ───────────────────────────────────────────────────────

const MultiInputRow = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		width: 100%;
		padding: 4px 6px;
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

const Chips = styled(Combobox.Chips, [
	f.responsive(css`
		display: contents;
	`),
])

const Chip = styled(Combobox.Chip, [
	f.responsive(css`
		display: flex;
		align-items: center;
		background-color: #e5e7eb;
		color: ${colors.black};
		border-radius: 6px;
		padding: 3px 3px 3px 8px;
		gap: 4px;
		outline: 0;
		cursor: default;
		font-size: 14px;

		&:focus-within {
			background-color: ${colors.blue};
			color: white;
		}

		@media (hover: hover) {
			&[data-highlighted] {
				background-color: ${colors.blue};
				color: white;
			}
		}
	`),
])

const ChipRemove = styled(Combobox.ChipRemove, [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
		color: inherit;
		font-size: 14px;
		line-height: 1;
		padding: 4px;
		
		@media (hover: hover) {
			&:hover {
				background: #d1d5db;
			}
		}
	`),
])

// ─── Shared input / trigger ───────────────────────────────────────────────────

const ComboboxInput = styled(Combobox.Input, [
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

const MultiInput = styled(Combobox.Input, [
	f.responsive(css`
		flex: 1;
		min-width: 48px;
		height: 32px;
		border: none;
		outline: none;
		background: transparent;
		color: ${colors.black};
		padding-left: 6px;

		&::placeholder {
			color: #9ca3af;
		}
	`),
])

const ComboboxTrigger = styled(Combobox.Trigger, [
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

const Chevron = styled("span", [
	f.responsive(css`
		font-size: 18px;
		color: #6b7280;
	`),
])

// ─── Popup ────────────────────────────────────────────────────────────────────

const Popup = styled(Combobox.Popup, [
	f.responsive(css`
		background: white;
		border-radius: 6px;
		outline: 1px solid #e5e7eb;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 10%),
			0 4px 6px -4px rgb(0 0 0 / 10%);
		color: ${colors.black};
		width: var(--anchor-width);
		max-width: var(--available-width);
		transition:
			opacity 100ms,
			transform 100ms;
		transform-origin: var(--transform-origin);

		&[data-starting-style],
		&[data-ending-style] {
			opacity: 0;
			transform: scale(0.95);
		}
	`),
])

const List = styled(Combobox.List, [
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

const Empty = styled(Combobox.Empty, [
	f.responsive(css`
		&:not(:empty) {
			color: #9ca3af;
			line-height: 1rem;
			padding: 1rem;
		}
	`),
])

const Item = styled(Combobox.Item, [
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

const ItemIndicator = styled("span", [
	f.responsive(css`
		grid-column-start: 1;
		display: flex;
		align-items: center;
		font-size: 12px;
	`),
])

const ItemText = styled("span", [
	f.responsive(css`
		grid-column-start: 2;
	`),
])
