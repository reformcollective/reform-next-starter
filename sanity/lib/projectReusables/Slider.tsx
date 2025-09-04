import { type NumberInputProps, set, unset } from "sanity"

/**
 * Options for creating a slider input component.
 * @property min Minimum value for the slider (default: 0)
 * @property max Maximum value for the slider (default: 100)
 * @property step Step value for the slider (default: 1)
 */

interface CreateSliderOptions {
	/**
	 * Minimum value for the slider.
	 * @default 0
	 */
	min?: number

	/**
	 * Maximum value for the slider.
	 * @default 100
	 */
	max?: number

	/**
	 * Step value for the slider.
	 * @default 1
	 */
	step?: number
}

/**
 * Factory function to create a slider input React component for Sanity forms.
 *
 * @param options - Configuration options for the slider.
 * @returns Slider input component for Sanity number fields.
 */
export function createSliderInput(options: CreateSliderOptions = {}) {
	const { min = 0, max = 100, step = 1 } = options

	/**
	 * Slider input component for Sanity number fields.
	 *
	 * @param props - Props from Sanity number input.
	 * @returns Slider input element.
	 */
	return function SliderInput(props: NumberInputProps) {
		const { onChange, value = 0 } = props

		/**
		 * Handles slider value change event.
		 *
		 * @param event - Change event from input.
		 */
		const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = Number(event.target.value)
			onChange(newValue ? set(newValue) : unset())
		}

		return (
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value || 0}
					onChange={handleChange}
					style={{ flex: 1 }}
				/>
				<span style={{ minWidth: "40px", textAlign: "right" }}>{value}%</span>
			</div>
		)
	}
}
