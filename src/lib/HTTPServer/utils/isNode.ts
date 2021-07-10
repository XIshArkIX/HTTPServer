export const isNode = () =>
  process.platform === 'win32' ? process.argv[0].endsWith('.exe') : true;
