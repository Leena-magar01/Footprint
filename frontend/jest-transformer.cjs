const tsJest = require('ts-jest').default;
const baseTransformer = tsJest.createTransformer({
  tsconfig: {
    target: 'es2022',
    module: 'commonjs',
    lib: ['es2022'],
    types: ['jest', 'node'],
    esModuleInterop: true,
    strict: true,
    skipLibCheck: true,
    moduleResolution: 'node',
    noEmit: true
  }
});

module.exports = {
  process(sourceText, sourcePath, options) {
    const modifiedSource = sourceText.replace(/\bimport\.meta\.env\b/g, 'process.env');
    return baseTransformer.process(modifiedSource, sourcePath, options);
  },
  getCacheKey(sourceText, sourcePath, options) {
    return baseTransformer.getCacheKey(sourceText, sourcePath, options);
  }
};
