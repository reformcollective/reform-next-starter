"use client"

import * as React from "react"
import { Field } from "@base-ui/react/field"
import { Form } from "@base-ui/react/form"
import { Button } from "@base-ui/react/button"
import { css, f, styled } from "library/styled/alpha"
import { colors } from "app/styles/colors.css"
import { submitForm, type FormState } from "./actions"

export default function ActionTestForm() {
	const [state, formAction, loading] = React.useActionState<FormState, FormData>(submitForm, {})

	return (
		<Wrapper>
			<Card>
				<h1>useActionState Test</h1>
				<p style={{ color: "#6b7280", margin: 0 }}>
					Try &quot;admin&quot; (reserved) or anything else (50% chance taken).
				</p>
				{state.success ? (
					<p style={{ color: "#15803d" }}>Username registered!</p>
				) : (
					<Form
						errors={state.serverErrors}
						action={formAction}
						style={{ display: "flex", flexDirection: "column", gap: 24 }}
					>
						<Field.Root
							name="username"
							style={{ display: "flex", flexDirection: "column", gap: 6 }}
						>
							<StyledLabel>Username</StyledLabel>
							<StyledInput
								required
								defaultValue={state.values?.username ?? "admin"}
								placeholder="e.g. alice132"
							/>
							<Field.Error style={{ color: colors.red }} />
						</Field.Root>
						<StyledButton type="submit" disabled={loading} focusableWhenDisabled>
							{loading ? "Submitting..." : "Submit"}
						</StyledButton>
					</Form>
				)}
			</Card>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-area: content;
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80px 24px;
		background-color: #f9fafb;
	`),
])

const Card = styled("div", [
	f.responsive(css`
		width: 100%;
		max-width: 480px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		padding: 40px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	`),
])

const StyledLabel = styled(Field.Label, [
	f.responsive(css`
		color: ${colors.black};
		font-weight: 500;
	`),
])

const StyledInput = styled(Field.Control, [
	f.responsive(css`
		box-sizing: border-box;
		padding: 0 16px;
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

const StyledButton = styled(Button, [
	f.responsive(css`
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 44px;
		padding: 0 20px;
		margin: 0;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background-color: ${colors.black};
		font-family: inherit;
		font-size: 16px;
		font-weight: 500;
		color: white;
		cursor: pointer;

		@media (hover: hover) {
			&:hover:not([data-disabled]) {
				opacity: 0.9;
			}
		}

		&:focus-visible {
			outline: 2px solid ${colors.blue};
			outline-offset: 2px;
		}

		&[data-disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}
	`),
])
