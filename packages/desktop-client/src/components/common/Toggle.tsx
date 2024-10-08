import React from 'react';

import { css } from 'glamor';

import { type CSSProperties, theme } from '../../style';

import { View } from './View';

type ToggleProps = {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: (on: boolean) => void;
  className?: string;
  style?: CSSProperties;
};

export const Toggle = ({
  id,
  checked,
  disabled,
  onToggle,
  className,
  style,
}: ToggleProps) => {
  return (
    <View style={style} className={className}>
      <input
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={e => onToggle?.(e.target.checked)}
        className={`${css({
          height: 0,
          width: 0,
          visibility: 'hidden',
        })}`}
        type="checkbox"
      />
      <label
        data-toggle-container
        data-on={checked}
        className={`${css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          width: '32px',
          height: '16px',
          borderRadius: '100px',
          position: 'relative',
          transition: 'background-color .2s',
          background: checked
            ? theme.checkboxToggleBackgroundSelected
            : theme.checkboxToggleBackground,
        })}`}
        htmlFor={id}
      >
        <span
          data-toggle
          data-on={checked}
          className={`${css(
            {
              content: ' ',
              position: 'absolute',
              top: '2px',
              left: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '100px',
              transition: '0.2s',
              boxShadow: '0 0 2px 0 rgba(10, 10, 10, 0.29)',
              background: disabled ? theme.checkboxToggleDisabled : '#fff',
            },
            checked && {
              left: 'calc(100% - 2px)',
              transform: 'translateX(-100%)',
            },
          )}`}
        />
      </label>
    </View>
  );
};
