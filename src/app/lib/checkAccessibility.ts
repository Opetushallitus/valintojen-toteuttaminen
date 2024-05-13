import React from 'react';

export function checkAccessibility() {
  if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.TEST !== 'true'
  ) {
    Promise.all([import('@axe-core/react'), import('react-dom')]).then(
      ([axe, ReactDOM]) => axe.default(React, ReactDOM, 1000),
    );
  }
}
