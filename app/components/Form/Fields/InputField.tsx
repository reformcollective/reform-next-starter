"use client"

import { useState, type RefObject } from "react"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { css, f, styled } from "library/styled"
import { colors } from "app/styles/colors.css"

interface InputFieldProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the input. */
	label: string
	/** HTML input type. @default "text" */
	type?: "text" | "email" | "url" | "password" | "tel"
	/** Marks the field as required, appends "*" to the label. */
	required?: boolean
	/** Disables the input and prevents interaction. */
	disabled?: boolean
	/** Placeholder text shown when the input is empty. */
	placeholder?: string
	/** HTML autocomplete hint (e.g. "name", "email", "new-password"). */
	autoComplete?: string
	/** Regex pattern the value must match to be valid. */
	pattern?: string
	/** Minimum character length for the value to be valid. */
	minLength?: number
	/** Maximum character length for the value to be valid. */
	maxLength?: number
	/** Helper text displayed below the input. */
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
	/**
	 * Ref exposing imperative actions like `validate()` for cross-field validation.
	 *
	 * @example
	 * ```tsx
	 * const confirmRef = useRef<FieldRoot.Actions | null>(null)
	 *
	 * <Input
	 *   name="password"
	 *   validationMode="onChange"
	 *   validate={() => {
	 *     confirmRef.current?.validate()
	 *     return null
	 *   }}
	 * />
	 * <Input
	 *   name="confirmPassword"
	 *   actionsRef={confirmRef}
	 *   validationMode="onChange"
	 *   validate={(value, formValues) =>
	 *     value === formValues.password ? null : "Passwords do not match"
	 *   }
	 * />
	 * ```
	 */
	actionsRef?: RefObject<FieldRoot.Actions | null>
}

export function InputField({
	name,
	label,
	type = "text",
	required,
	disabled,
	placeholder,
	autoComplete,
	pattern,
	minLength,
	maxLength,
	hint,
	validate,
	validationMode,
	validationDebounceTime,
	actionsRef,
}: InputFieldProps) {
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
				{required && "*"}
			</Label>
			<InputWrapper>
				<Control
					type={type}
					required={required}
					placeholder={placeholder}
					autoComplete={autoComplete}
					pattern={pattern}
					minLength={minLength}
					maxLength={maxLength}
					onChange={(e) => setFilled((e.target as HTMLInputElement).value !== "")}
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
			</InputWrapper>
			{hint && <Description>{hint}</Description>}
			<Field.Error />
		</StyledFieldRoot>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const StyledFieldRoot = styled(
	Field.Root,
	[
		f.responsive(css`
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: 6px;
		`),
	],
	"InputField",
)

const Label = styled(
	Field.Label,
	[
		f.responsive(css`
		color: ${colors.black};
	`),
	],
	"InputLabel",
)

const Description = styled(
	Field.Description,
	[
		f.responsive(css`
			color: #6b7280;
		`),
	],
	"InputDescription",
)

const InputWrapper = styled(
	"div",
	[
		f.responsive(css`
			position: relative;
			width: 100%;
		`),
	],
	"InputWrapper",
)

const Control = styled(
	Field.Control,
	[
		f.responsive(css`
		box-sizing: border-box;
		padding: 0 16px;
		padding-right: 40px;
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
	],
	"InputControl",
)

const IconSlot = styled(
	"span",
	[
		f.responsive(css`
			position: absolute;
			right: 12px;
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			pointer-events: none;
			font-size: 14px;
			line-height: 1;
		`),
	],
	"InputIconSlot",
)

const ValidIcon = styled(
	"span",
	[
		f.responsive(css`
			color: #15803d;
		`),
	],
	"InputValidIcon",
)

const ErrorIcon = styled(
	"span",
	[
		f.responsive(css`
		color: ${colors.red};
	`),
	],
	"InputErrorIcon",
)
