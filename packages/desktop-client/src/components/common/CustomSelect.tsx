import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from '@reach/listbox';
import { type CSSProperties, css } from 'glamor';

import ExpandArrow from '../../icons/v0/ExpandArrow';
import { colors, styles } from '../../style';
import { MONTH_BOX_SHADOW } from '../budget/constants';

type CustomSelectProps = {
  options: Array<[string, string]>;
  value: string;
  defaultLabel?: string;
  onChange?: (newValue: string) => void;
  style?: CSSProperties;
  wrapperStyle?: CSSProperties;
  disabledKeys?: string[];
};

/**
 * @param {Array<[string, string]>} options - An array of options value-label pairs.
 * @param {string} value - The currently selected option value.
 * @param {string} [defaultLabel] - The label to display when the selected value is not in the options.
 * @param {function} [onChange] - A callback function invoked when the selected value changes.
 * @param {CSSProperties} [style] - Custom styles to apply to the selected button.
 * @param {CSSProperties} [wrapperStyle] - Custom style to apply to the select wrapper.
 * @param {string[]} [disabledKeys] - An array of option values to disable.
 *
 * @example
 * // Usage:
 * // <CustomSelect options={[['1', 'Option 1'], ['2', 'Option 2']]} value="1" onChange={handleOnChange} />
 * // <CustomSelect options={[['1', 'Option 1'], ['2', 'Option 2']]} value="3" defaultLabel="Select an option"  onChange={handleOnChange} />
 */

export default function CustomSelect({
  options,
  value,
  defaultLabel = '',
  onChange,
  style,
  wrapperStyle,
  disabledKeys = [],
}: CustomSelectProps) {
  const arrowSize = 7;
  const targetOption = options.filter(option => option[0] === value);
  return (
    <ListboxInput
      value={value}
      onChange={onChange}
      style={{
        color: colors.formInputText,
        backgroundColor: colors.formInputBackground,
        borderRadius: styles.menuBorderRadius,
        lineHeight: '1em',
        ...wrapperStyle,
      }}
    >
      <ListboxButton
        {...css([
          {
            borderWidth: 0,
            padding: '2px 5px',
            borderRadius: 4,
          },
          style,
        ])}
        arrow={
          <ExpandArrow
            style={{
              width: arrowSize,
              height: arrowSize,
              color: 'inherit',
            }}
          />
        }
      >
        <span
          style={{
            display: 'flex',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: `calc(100% - ${arrowSize + 5}px)`,
            minHeight: '18px',
            alignItems: 'center',
          }}
        >
          {targetOption.length !== 0 ? targetOption[0][1] : defaultLabel}
        </span>
      </ListboxButton>
      <ListboxPopover
        style={{
          zIndex: 10000,
          outline: 0,
          borderRadius: styles.menuBorderRadius,
          backgroundColor: colors.menuBackground,
          boxShadow: MONTH_BOX_SHADOW,
          border: '1px solid ' + colors.menuBorder,
        }}
      >
        <ListboxList style={{ maxHeight: 250, overflowY: 'auto' }}>
          {options.map(([value, label]) => (
            <ListboxOption
              key={value}
              value={value}
              disabled={disabledKeys.includes(value)}
              {...css({
                '[data-reach-listbox-option]': {
                  background: colors.menuItemBackground,
                  color: colors.menuItemText,
                },
                '[data-reach-listbox-option][data-current-nav]': {
                  background: colors.menuItemBackgroundHover,
                  color: colors.menuItemTextHover,
                },
              })}
            >
              {label}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
