import { Response } from "express";

/**
 * Mock Response class for testing Express routes without supertest
 */
export class MockResponse {
  private statusCode: number = 200;
  private responseBody: any = {};
  private headers: Record<string, string> = {};
  private cookies: Record<string, any> = {};

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.responseBody = data;
    return this;
  }

  send(data: any) {
    this.responseBody = data;
    return this;
  }

  setHeader(name: string, value: string) {
    this.headers[name] = value;
    return this;
  }

  cookie(name: string, value: any, options?: any) {
    this.cookies[name] = { value, options };
    return this;
  }

  clearCookie(name: string) {
    delete this.cookies[name];
    return this;
  }

  getStatus() {
    return this.statusCode;
  }

  getJson() {
    return this.responseBody;
  }

  getHeaders() {
    return this.headers;
  }

  getCookies() {
    return this.cookies;
  }
}

/**
 * Creates a mock request object for testing
 */
export function createMockRequest(options: {
  body?: any;
  params?: any;
  query?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  user?: any;
}) {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    user: options.user || null
  };
}
