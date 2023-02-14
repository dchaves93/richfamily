import * as React from 'react';

const SvgCloudUnknown = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    style={{
      color: '#242134',
      ...props.style,
    }}
  >
    <path
      d="M3.566 15.457a1 1 0 0 0-.5-.844 2.248 2.248 0 0 1-.431-.329A2.371 2.371 0 0 1 2 12.5a2.588 2.588 0 0 1 2.585-2.588 2.645 2.645 0 0 1 .536.056A1 1 0 0 0 6.324 9c.081-5.754 8.3-7.363 10.818-2.045a.97.97 0 0 0 .941.571 3.7 3.7 0 0 1 3 1.3 3.874 3.874 0 0 1 .908 2.811 3.428 3.428 0 0 1-1.1 2.375 1.316 1.316 0 0 0-.42 1.089.912.912 0 0 0 1.476.628A5.408 5.408 0 0 0 24 11.418a5.763 5.763 0 0 0-5.22-5.866.25.25 0 0 1-.19-.12 7.685 7.685 0 0 0-14.1 2.3.251.251 0 0 1-.227.2 4.642 4.642 0 0 0-3.643 2.24A4.471 4.471 0 0 0 0 12.619a4.287 4.287 0 0 0 1.235 3.09 4.177 4.177 0 0 0 .852.645 1 1 0 0 0 1.478-.9Z"
      fill="currentColor"
    />
    <path
      d="M18.5 15.8a6.5 6.5 0 1 0-6.5 6.5 6.508 6.508 0 0 0 6.5-6.5Zm-7.25 1.25v-.55a1.257 1.257 0 0 1 .986-1.221 1.125 1.125 0 1 0-1.361-1.1.75.75 0 1 1-1.5 0 2.625 2.625 0 1 1 3.538 2.461.25.25 0 0 0-.163.234v.18a.75.75 0 0 1-1.5 0ZM12 18.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgCloudUnknown;
