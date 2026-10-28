"use client"

import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"

interface Option<T extends string> {
	value: T
	label: string
}

export function Toggle({
	label,
	checked,
	onChange,
	disabled,
}: {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
	disabled?: boolean
}) {
	return (
		<CheckRow>
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<Label>{label}</Label>
		</CheckRow>
	)
}

export function Choice<T extends string>({
	label,
	value,
	options,
	onChange,
	disabled,
}: {
	label: string
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
	disabled?: boolean
}) {
	return (
		<Field>
			<Label>{label}</Label>
			<Select
				value={value}
				disabled={disabled}
				onChange={(event) => {
					const next = options.find((option) => option.value === event.target.value)
					if (next) onChange(next.value)
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</Select>
		</Field>
	)
}

export function NumberField({
	label,
	value,
	onChange,
	min,
	max,
	step,
	disabled,
}: {
	label: string
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	step?: number
	disabled?: boolean
}) {
	return (
		<Field>
			<Label>{label}</Label>
			<Input
				type="number"
				value={value}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</Field>
	)
}

export function Slider({
	label,
	value,
	onChange,
	disabled,
}: {
	label: string
	value: number
	onChange: (value: number) => void
	disabled?: boolean
}) {
	return (
		<Field>
			<Label>
				{label} {value.toFixed(2)}
			</Label>
			<input
				type="range"
				min={0}
				max={1}
				step={0.05}
				value={value}
				disabled={disabled}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</Field>
	)
}

export function TextField({
	label,
	value,
	onChange,
	placeholder,
	disabled,
}: {
	label: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
}) {
	return (
		<Field>
			<Label>{label}</Label>
			<Input
				type="text"
				value={value}
				placeholder={placeholder}
				disabled={disabled}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Field>
	)
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
	return (
		<GroupBox>
			<GroupTitle>{title}</GroupTitle>
			{children}
		</GroupBox>
	)
}

/** Button row that picks one of a few views. */
export function Tabs<T extends string>({
	value,
	options,
	onChange,
}: {
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
}) {
	return (
		<TabRow>
			{options.map((option) => (
				<Tab
					key={option.value}
					type="button"
					data-active={option.value === value ? "" : undefined}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</Tab>
			))}
		</TabRow>
	)
}

const Field = styled("label", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	`),
])

const CheckRow = styled("label", [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 8px;
	`),
])

const Label = styled("span", [
	f.responsive(css`
		${textStyles.p3}
	`),
])

const Select = styled("select", [
	f.responsive(css`
		${textStyles.p3}
		padding: 4px 8px;
		border: 1px solid rgb(128 128 128 / 50%);
		border-radius: 4px;
	`),
])

const Input = styled("input", [
	f.responsive(css`
		${textStyles.p3}
		min-width: 0;
		padding: 4px 8px;
		border: 1px solid rgb(128 128 128 / 50%);
		border-radius: 4px;
	`),
])

const GroupBox = styled("fieldset", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
		margin: 0;
		padding: 12px;
		border: 1px solid rgb(128 128 128 / 35%);
		border-radius: 8px;
	`),
])

const GroupTitle = styled("legend", [
	f.responsive(css`
		${textStyles.kicker2}
		padding: 0 6px;
		opacity: 0.7;
		text-transform: uppercase;
	`),
])

const TabRow = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	`),
])

const Tab = styled("button", [
	f.responsive(css`
		${textStyles.p3}
		padding: 4px 12px;
		border: 1px solid currentcolor;
		border-radius: 4px;
		cursor: pointer;

		&[data-active] {
			outline: 2px solid currentcolor;
			font-weight: 700;
		}
	`),
])
