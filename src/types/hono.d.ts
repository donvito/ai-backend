declare module 'hono' {
  export interface Context {
    req: any;
    json?: (body: unknown, status?: number) => Response;
  }
  export interface Next {}
  export class Hono {
    routes: any[];
    route(path: string, handler: any): this;
    fetch: (input: Request | string, init?: RequestInit) => Promise<Response>;
  }
}