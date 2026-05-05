"use client"

import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import type { RefObject } from "react"

import { Field } from "@base-ui/react/field"
import { Select } from "@base-ui/react/select"
import { colors } from "app/styles/colors.css"
import { css, f, styled } from "library/styled"

interface Option {
	value: string | null
	label: string
}

interface SelectFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the select. */
	label: string
	/** Marks the field as required, appends "*" to the label. */
	required?: boolean
	/** Disables the select and prevents interaction. */
	disabled?: boolean
	/** Placeholder text shown when no option is selected. */
	placeholder?: string
	/** Helper text displayed below the select. */
	hint?: string
	/** The list of options to display. */
	items: Option[]
	/** The controlled selected value. */
	value?: string
	/** The default selected value (uncontrolled). */
	defaultValue?: string
	/**
	 * When `true` (default), the popup overlaps the trigger so the selected item’s text
	 * aligns with the trigger’s value text. `data-side` will be `"none"` on the Popup
	 * and Positioner when this mode is active.
	 *
	 * Falls back to standard positioning when:
	 * - The popup was opened via touch
	 * - There isn’t enough viewport space to align without making the popup too small
	 *   (customizable via `min-height` on the Positioner; the trigger must also be ≥20px
	 *   from the top/bottom viewport edges)
	 *
	 * `side` and `align` props are ignored while this mode is active, but apply normally in fallback mode.
	 *
	 * Set to `false` to prevent the popup from overlapping the trigger.
	 * @default true
	 */
	alignItemWithTrigger?: boolean
	/** Callback when the selected value changes. */
	onValueChange?: (value: string | null) => void
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

export function SelectField({
	name,
	label,
	required,
	disabled,
	placeholder,
	hint,
	items,
	value,
	defaultValue,
	alignItemWithTrigger,
	onValueChange,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: SelectFieldProps) {
	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<Field.Label nativeLabel={false} render={<Label />}>
				{label}
				{required && " *"}
			</Field.Label>
			<Select.Root
				required={required}
				items={items}
				value={value}
				defaultValue={defaultValue}
				onValueChange={onValueChange}
			>
				<Trigger>
					<Select.Value placeholder={placeholder} />
					<Select.Icon>
						<ChevronUpDownIcon />
					</Select.Icon>
				</Trigger>
				<Select.Portal>
					<Select.Positioner sideOffset={8} alignItemWithTrigger={alignItemWithTrigger}>
						<Popup>
							<List>
								{items.map(({ label, value }) => (
									<Item key={value} value={value}>
										<Select.ItemIndicator render={<ItemIndicator />}>✓</Select.ItemIndicator>
										<Select.ItemText render={<ItemText />}>{label}</Select.ItemText>
									</Item>
								))}
							</List>
						</Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
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

const Trigger = styled(Select.Trigger, [
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

const Popup = styled(Select.Popup, [
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

const List = styled(Select.List, [
	f.responsive(css`
		box-sizing: border-box;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding-block: 4px;
		scroll-padding-block: 4px;
		outline: none;
		max-height: min(23rem, var(--available-height));
	`),
])

const Item = styled(Select.Item, [
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

function ChevronUpDownIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg
			width="8"
			height="12"
			viewBox="0 0 8 12"
			fill="none"
			stroke="currentcolor"
			strokeWidth="1.5"
			{...props}
		>
			<path d="M0.5 4.5L4 1.5L7.5 4.5" />
			<path d="M0.5 7.5L4 10.5L7.5 7.5" />
		</svg>
	)
}
