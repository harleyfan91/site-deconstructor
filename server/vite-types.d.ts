declare module 'vite' {
  export interface InlineConfig {
    server?: ServerOptions;
  }
  
  export interface ServerOptions {
    middlewareMode?: boolean;
    hmr?: any;
    allowedHosts?: boolean | true | string[] | undefined;
    host?: boolean | string;
  }
}