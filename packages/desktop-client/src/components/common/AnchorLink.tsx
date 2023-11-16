import { type ReactNode } from 'react';
import { NavLink, useMatch } from 'react-router-dom';

import { css } from 'glamor';

import { type CSSProperties, styles } from '../../style';

type AnchorLinkProps = {
  to: string;
  style?: CSSProperties;
  activeStyle?: CSSProperties;
  children?: ReactNode;
  report?: [];
};

export default function AnchorLink({
  to,
  style,
  activeStyle,
  children,
  report,
}: AnchorLinkProps) {
  let match = useMatch({ path: to });

  return (
    <NavLink
      to={to}
      state={report ? { report: report } : {}}
      className={`${css([
        styles.smallText,
        style,
        match ? activeStyle : null,
      ])}`}
    >
      {children}
    </NavLink>
  );
}
