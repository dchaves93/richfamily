import React, {
  type KeyboardEvent,
  type ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Input as ReactAriaInput } from 'react-aria-components';

import { css } from 'glamor';

import { useMergedRefs } from '../../hooks/useMergedRefs';
import { styles, theme } from '../../style';

type InputProps = ComponentPropsWithRef<typeof ReactAriaInput> & {
  autoSelect?: boolean;
  onEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onEscape?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onChangeValue?: (newValue: string) => void;
  onUpdate?: (newValue: string) => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      autoSelect,
      className = '',
      onEnter,
      onEscape,
      onChangeValue,
      onUpdate,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRefs<HTMLInputElement>(inputRef, ref);

    useEffect(() => {
      if (autoSelect) {
        // Select on mount does not work properly for inputs that are inside a dialog.
        // See https://github.com/facebook/react/issues/23301#issuecomment-1656908450
        // for the reason why we need to use setTimeout here.
        setTimeout(() => inputRef.current?.select());
      }
    }, [autoSelect]);

    const defaultButtonClassName = useCallback(
      () =>
        String(
          css(
            {
              outline: 0,
              backgroundColor: theme.tableBackground,
              color: theme.formInputText,
              margin: 0,
              padding: 5,
              borderRadius: 4,
              border: '1px solid ' + theme.formInputBorder,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              flexShrink: 0,
              '&[data-focused]': {
                border: '1px solid ' + theme.formInputBorderSelected,
                boxShadow: '0 1px 1px ' + theme.formInputShadowSelected,
              },
              '&::placeholder': { color: theme.formInputTextPlaceholder },
            },
            styles.smallText,
          ),
        ),
      [],
    );

    return (
      <ReactAriaInput
        ref={mergedRef}
        {...props}
        className={
          typeof className === 'function'
            ? renderProps =>
                `${defaultButtonClassName()} ${className(renderProps) || ''}`
            : `${defaultButtonClassName()} ${className || ''}`
        }
        onKeyDown={e => {
          props.onKeyDown?.(e);

          if (e.key === 'Enter' && onEnter) {
            onEnter(e);
          }

          if (e.key === 'Escape' && onEscape) {
            onEscape(e);
          }
        }}
        onBlur={e => {
          onUpdate?.(e.target.value);
          props.onBlur?.(e);
        }}
        onChange={e => {
          onChangeValue?.(e.target.value);
          props.onChange?.(e);
        }}
      />
    );
  },
);

Input.displayName = 'Input';

type BigInputProps = InputProps;

export const BigInput = forwardRef<HTMLInputElement, BigInputProps>(
  ({ className, ...props }, ref) => {
    const defaultClassName = useCallback(
      () =>
        String(
          css({
            padding: 10,
            fontSize: 15,
            '&, &[data-focused]': { border: 'none', ...styles.shadow },
          }),
        ),
      [],
    );
    return (
      <Input
        ref={ref}
        {...props}
        className={renderProps =>
          typeof className === 'function'
            ? `${defaultClassName()} ${className(renderProps)}`
            : `${defaultClassName()}  ${className}`
        }
      />
    );
  },
);

BigInput.displayName = 'BigInput';
