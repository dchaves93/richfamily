import * as React from 'react';

const SvgAirplane = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    style={{
      color: '#242134',
      ...props.style,
    }}
  >
    <path
      d="M8.4 12H2.8L1 15H0V5h1l1.8 3h5.6L6 0h2l4.8 8H18a2 2 0 1 1 0 4h-5.2L8 20H6l2.4-8z"
      fill="currentColor"
    />
  </svg>
);

export default SvgAirplane;
