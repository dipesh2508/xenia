import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

type RequestOptions = {
  body?: any;
  query?: ParsedQs;
  params?: ParamsDictionary;
  cookies?: { [key: string]: string };
  headers?: { [key: string]: string };
  user?: any;
};

/**
 * Creates a mock Express request object
 */
export function createMockRequest(options: RequestOptions = {}): Request {
  const req = {
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    cookies: options.cookies || {},
    headers: options.headers || {},
    user: options.user,
    
    // Add required Express.Request properties
    app: {},
    res: {},
    signedCookies: {},
    
    // Common methods with Jasmine spies
    get: jasmine.createSpy('get').and.callFake((header: string) => options.headers?.[header]),
    header: jasmine.createSpy('header').and.callFake((header: string) => options.headers?.[header]),
    accepts: jasmine.createSpy('accepts').and.returnValue(true),
    acceptsCharsets: jasmine.createSpy('acceptsCharsets').and.returnValue(true),
    acceptsEncodings: jasmine.createSpy('acceptsEncodings').and.returnValue(true),
    acceptsLanguages: jasmine.createSpy('acceptsLanguages').and.returnValue(true),
    range: jasmine.createSpy('range').and.returnValue(null),
    
    // Add other required properties
    baseUrl: '',
    originalUrl: '',
    path: '',
    hostname: '',
    ip: '',
    method: 'GET',
    protocol: 'http',
    secure: false,
    xhr: false,
    
    // Add required methods
    is: jasmine.createSpy('is').and.returnValue(false),
    param: jasmine.createSpy('param').and.returnValue(null)
  } as unknown as Request;

  return req;
}

/**
 * Mock Express Response class that can be used in controller tests
 */
export class MockResponse {
  private statusCode: number = 200;
  private jsonData: any = null;
  private headers: Record<string, string> = {};
  private cookies: Record<string, any> = {};
  private clearedCookies: string[] = [];

  status(code: number): MockResponse {
    this.statusCode = code;
    return this;
  }

  json(data: any): MockResponse {
    this.jsonData = data;
    return this;
  }

  setHeader(name: string, value: string): MockResponse {
    this.headers[name] = value;
    return this;
  }

  cookie(name: string, value: string, options?: any): MockResponse {
    this.cookies[name] = { value, options };
    return this;
  }

  clearCookie(name: string): MockResponse {
    this.clearedCookies.push(name);
    return this;
  }

  getStatus(): number {
    return this.statusCode;
  }

  getJson(): any {
    return this.jsonData;
  }

  getHeaders(): Record<string, string> {
    return this.headers;
  }

  getCookies(): Record<string, any> {
    return this.cookies;
  }

  getClearedCookies(): string[] {
    return this.clearedCookies;
  }
}
