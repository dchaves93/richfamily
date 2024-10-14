import { type ComponentPropsWithRef, type ReactNode, forwardRef } from 'react';

import { css } from 'glamor';

import { type CSSProperties, theme } from '../../style';

import { Input } from './Input';
import { View } from './View';

type InputWithContentProps = ComponentPropsWithRef<typeof Input> & {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  inputStyle?: CSSProperties;
};
export const InputWithContent = forwardRef<
  HTMLInputElement,
  InputWithContentProps
>(
  (
    { leftContent, rightContent, inputStyle, style, className = '', ...props },
    ref,
  ) => {
    return (
      <View
        style={{
          outline: 0,
          backgroundColor: theme.tableBackground,
          color: theme.formInputText,
          margin: 0,
          borderRadius: 4,
          border: '1px solid ' + theme.formInputBorder,
          padding: 0,
          flexDirection: 'row',
          alignItems: 'center',
          ...style,
        }}
        className={`${css({
          '&:focus-within': {
            boxShadow: '0 0 0 1px ' + theme.formInputShadowSelected,
          },
          '& input, input[data-focused], input[data-hovered]': {
            border: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            color: 'inherit',
          },
        })} ${className}`}
      >
        {leftContent}
        <Input
          ref={ref}
          {...props}
          style={{
            width: '100%',
            flex: 1,
            ...inputStyle,
          }}
        />
        {rightContent}
      </View>
    );
  },
);

InputWithContent.displayName = 'InputWithContent';
