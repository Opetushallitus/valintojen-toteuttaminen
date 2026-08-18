import { Plugin } from 'vite';

const escapeRegex = (str: string) =>
  str.replace(/[/\-\\^$*+?.()|[\]{}]/g, String.raw`\$&`);

/**
 * Transforms the named imports to direct imports for the given packages
 */
export const optimizePackageImports = (pkgNames: Array<string>) => {
  const importRegex = new RegExp(
    String.raw`^import\s+{\s*([^}]+)\s*}\s+from\s+['"](${pkgNames.map((p) => escapeRegex(p)).join('|')})['"]`,
    'm', // <- only match first occurrence
  );

  return {
    name: 'optimize-package-imports',
    transform(code, id) {
      if (
        (id.endsWith('.tsx') || id.endsWith('.ts') || id.endsWith('.js')) &&
        importRegex.test(code)
      ) {
        const transformed = code.replace(
          importRegex,
          (_match, imports: string, matchedPackageName: string) => {
            return imports
              .split(',')
              .map((importName) => {
                const [subName, asName = subName] = importName
                  .split(' as ')
                  .map((s) => s.trim());
                return `import ${asName} from '${matchedPackageName}/${subName}'`;
              })
              .join('\n');
          },
        );
        // map: null tells Rollup this transform intentionally has no sourcemap,
        // avoiding a "Sourcemap is likely to be incorrect" warning. Returning
        // undefined (above) for untouched files avoids the warning entirely,
        // since Rollup flags any transform() return value lacking a map.
        return { code: transformed, map: null };
      }
    },
  } as Plugin;
};
