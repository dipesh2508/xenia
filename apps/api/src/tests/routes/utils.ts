import path from 'path';

/**
 * Helper function to get the absolute path from a relative path
 */
export function getAbsolutePath(relativePath: string): string {
  return path.join(process.cwd(), relativePath);
}

/**
 * Helper function to mock imports in test files
 */
export function mockModule(modulePath: string, mockImplementation: any): void {
  jest.doMock(modulePath, () => mockImplementation);
}

/**
 * Helper to create a jasmine spy object
 */
export function createSpyObj(baseName: string, methods: string[]) {
  const obj: any = {};
  for (const method of methods) {
    obj[method] = jasmine.createSpy(`${baseName}.${method}`);
  }
  return obj;
}
