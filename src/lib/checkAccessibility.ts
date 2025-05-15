import React from 'react';
import { isProd, isTesting } from './configuration/configuration';
import { isServer } from './common';

export function checkAccessibility() {
  if (!isServer && !isProd && !isTesting) {
    Promise.all([import('@axe-core/react'), import('react-dom')]).then(
      ([axe, ReactDOM]) => axe.default(React, ReactDOM, 1000),
    );
  }
}
