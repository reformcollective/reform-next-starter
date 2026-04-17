"use client"

import { type RefObject } from "react"
import { Slider } from "@base-ui/react/slider"
import { Field } from "@base-ui/react/field"
import type { FieldRoot } from "@base-ui/react/field"
import type { Form } from "@base-ui/react/form"
import { Fieldset } from "@base-ui/react/fieldset"
import { css, f, styled } from "library/styled"
import { colors } from "app/styles/colors.css"

interface SliderFieldCommonProps {
	/** Identifies the field when a form is submitted. */
	name: string
	/** Text displayed above the slider. */
	label: string
	/** Disables the slider and prevents interaction. */
	disabled?: boolean
	/** Helper text displayed below the slider. */
	hint?: string
	/** Minimum value. @default 0 */
	min?: number
	/** Maximum value. @default 100 */
	max?: number
	/** Step increment. @default 1 */
	step?: number
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

interface SliderFieldSingleProps extends SliderFieldCommonProps {
	range?: false
	/** Initial value for an uncontrolled single-thumb slider. */
	defaultValue?: number
	/** Controlled value for a single-thumb slider. */
	value?: number
	/** Callback fired when the value changes. */
	onValueChange?: (value: number) => void
}

interface SliderFieldRangeProps extends SliderFieldCommonProps {
	/** Enables two-thumb range mode. */
	range: true
	/** Initial values for an uncontrolled range slider. */
	defaultValue?: [number, number]
	/** Controlled values for a range slider. */
	value?: [number, number]
	/** Callback fired when the range values change. */
	onValueChange?: (value: number[]) => void
}

type SliderFieldProps = SliderFieldSingleProps | SliderFieldRangeProps

export function SliderField(props: SliderFieldProps) {
	const {
		name,
		label,
		disabled,
		hint,
		min,
		max,
		step,
		validate,
		validationMode,
		validationDebounceTime,
		actionsRef,
	} = props

	const sliderRender = props.range ? (
		<SliderRoot
			min={min}
			max={max}
			step={step}
			defaultValue={props.defaultValue}
			value={props.value}
			onValueChange={props.onValueChange}
		/>
	) : (
		<SliderRoot
			min={min}
			max={max}
			step={step}
			defaultValue={props.defaultValue}
			value={props.value}
			onValueChange={
				props.onValueChange ? (value: number) => props.onValueChange!(value) : undefined
			}
		/>
	)

	return (
		<StyledFieldRoot
			name={name}
			disabled={disabled}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			actionsRef={actionsRef}
		>
			<Fieldset.Root render={sliderRender}>
				<SliderHeader>
					<Fieldset.Legend render={<Legend />}>{label}</Fieldset.Legend>
					<Slider.Value render={<ValueText />} />
				</SliderHeader>
				<Slider.Control render={<Control />}>
					<Slider.Track render={<Track />}>
						<Slider.Indicator render={<Indicator />} />
						<Thumb index={0} />
						{props.range && <Thumb index={1} />}
					</Slider.Track>
				</Slider.Control>
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
		width: 100%;
	`),
])

const SliderRoot = styled(Slider.Root, [
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

const Legend = styled("legend", [
	f.responsive(css`
		color: ${colors.black};
	`),
])

const ValueText = styled("span", [
	f.responsive(css`
		color: #6b7280;
	`),
])

const Control = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		height: 20px;
	`),
])

const Track = styled("div", [
	f.responsive(css`
		position: relative;
		width: 100%;
		height: 4px;
		border-radius: 2px;
		background: #e5e7eb;
	`),
])

const Indicator = styled("div", [
	f.responsive(css`
		position: absolute;
		height: 100%;
		border-radius: 2px;
		background: ${colors.blue};
	`),
])

const Thumb = styled(Slider.Thumb, [
	f.responsive(css`
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		border: 2px solid ${colors.blue};
		cursor: pointer;
		transform: translateX(-50%);

		&:has(:focus-visible) {
			outline: 2px solid ${colors.blue};
			outline-offset: 1px;
		}
	`),
])

const Description = styled(Field.Description, [
	f.responsive(css`
		color: #6b7280;
	`),
])
