import { expect, test, describe } from 'vitest';
import { getConfigUrl } from './configuration-utils';

describe('Configuration: getConfigUrl', () => {
  test('replaces url placeholders with appropriate params', () => {
    const route = getConfigUrl('vaihdaparametrit/{marja}/ja/{vihannes}', {
      marja: 'mansikka',
      vihannes: 'kurkku',
    });
    expect(route).toEqual('vaihdaparametrit/mansikka/ja/kurkku');
  });

  test('Throws an error if all placeholders are not replaced with values', () => {
    expect(() =>
      getConfigUrl('vaihdaparametrit/{marja}/ja/{vihannes}', {
        marja: 'mansikka',
        vihanns: 'kurkku',
      }),
    ).toThrowError(
      'Not all placeholders were replaced in route vaihdaparametrit/{marja}/ja/{vihannes}. Result: vaihdaparametrit/mansikka/ja/{vihannes}',
    );
  });

  test('extra parameters do not have effect', () => {
    const route = getConfigUrl('vaihdaparametrit/{marja}/ja/{vihannes}', {
      marja: 'mansikka',
      vihannes: 'kurkku',
      hedelma: 'appelsiini',
    });
    expect(route).toEqual('vaihdaparametrit/mansikka/ja/kurkku');
  });

  test('accepts and returns route without placeholders and params', () => {
    const route = getConfigUrl('tassa/sulle/reitti');
    expect(route).toEqual('tassa/sulle/reitti');
  });
});
