import React from 'react';
import { isProd, isTesting } from './configuration';

export function checkAccessibility() {
  if (typeof window !== 'undefined' && !isProd && !isTesting) {
    Promise.all([import('@axe-core/react'), import('react-dom')]).then(
      ([axe, ReactDOM]) => axe.default(React, ReactDOM, 1000),
    );
  }
}
