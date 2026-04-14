"use client"

import { type RefObject } from "react"
import { Switch } from "@base-ui/react/switch"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "styles/colors.css"

interface SwitchFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed next to the switch. */
	label: string
	/** Disables the switch and prevents interaction. */
	disabled?: boolean
	/** Helper text displayed below the switch. */
	hint?: string
	/** Initial checked state for an uncontrolled switch. */
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

export function SwitchField({
	name,
	label,
	disabled,
	hint,
	defaultChecked,
	checked,
	onCheckedChange,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: SwitchFieldProps) {
	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<SwitchLabel>
				{label}
				<SwitchControl
					defaultChecked={defaultChecked}
					checked={checked}
					onCheckedChange={onCheckedChange}
				>
					<SwitchThumb />
				</SwitchControl>
			</SwitchLabel>
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

const SwitchControl = styled(Switch.Root, [
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

const SwitchThumb = styled(Switch.Thumb, [
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

const Description = styled(Field.Description, [
	f.responsive(css`
		color: #6b7280;
	`),
])
