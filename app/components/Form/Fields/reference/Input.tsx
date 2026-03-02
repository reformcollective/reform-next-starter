"use client"

import { Field } from "@base-ui/react/field"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"

export function Input() {
	return (
		<FieldRoot name="example">
			<Label>Label</Label>
			<InputWrapper>
				<Control
					type="text"
					required
					placeholder="Placeholder"
					minLength={2}
					maxLength={100}
					// pattern=".+@.+\..+"
					// autoComplete="name"
				/>
				<Field.Validity>
					{({ validity }) => {
						if (validity.valid === null) return null
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
			<Description>Helper text</Description>
			<Field.Error />
		</FieldRoot>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FieldRoot = styled(Field.Root, [
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

const InputWrapper = styled("div", [
	f.responsive(css`
		position: relative;
		width: 100%;
	`),
])

const Control = styled(Field.Control, [
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
])

const IconSlot = styled("span", [
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
])

const ValidIcon = styled("span", [
	f.responsive(css`
		color: #15803d;
	`),
])

const ErrorIcon = styled("span", [
	f.responsive(css`
		color: ${colors.red};
	`),
])
