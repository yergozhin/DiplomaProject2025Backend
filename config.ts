/* eslint-disable n/no-process-env */
/* eslint-disable n/no-unsupported-features/node-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

if (typeof globalThis.Headers === 'undefined') {
  // @ts-expect-error - Polyfill for Node < 18
  globalThis.Headers = class Headers {
    #headers: Map<string, string>;

    public constructor(init?: any) {
      this.#headers = new Map();
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]: [string, string]) => {
            this.#headers.set(key.toLowerCase(), value);
          });
        } else if (init && typeof init.forEach === 'function') {
          init.forEach((value: string, key: string) => {
            this.#headers.set(key.toLowerCase(), value);
          });
        } else {
          Object.entries(init).forEach(
            ([key, value]: [string, unknown]) => {
              this.#headers.set(
                key.toLowerCase(),
                String(value),
              );
            },
          );
        }
      }
    }

    public append(name: string, value: string): void {
      const existing = this.#headers.get(name.toLowerCase());
      this.#headers.set(
        name.toLowerCase(),
        existing ? `${existing}, ${value}` : value,
      );
    }

    public delete(name: string): void {
      this.#headers.delete(name.toLowerCase());
    }

    public get(name: string): string | null {
      return this.#headers.get(name.toLowerCase()) ?? null;
    }

    public has(name: string): boolean {
      return this.#headers.has(name.toLowerCase());
    }

    public set(name: string, value: string): void {
      this.#headers.set(name.toLowerCase(), value);
    }

    public forEach(
      callback: (value: string, key: string) => void,
    ): void {
      this.#headers.forEach((value, key) => callback(value, key));
    }

    public entries(): IterableIterator<[string, string]> {
      return this.#headers.entries();
    }

    public keys(): IterableIterator<string> {
      return this.#headers.keys();
    }

    public values(): IterableIterator<string> {
      return this.#headers.values();
    }

    public [Symbol.iterator](): IterableIterator<[string, string]> {
      return this.#headers.entries();
    }
  };
}

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import moduleAlias from 'module-alias';


// Check the env
const NODE_ENV = (process.env.NODE_ENV ?? 'development');

// Configure "dotenv"
const envPath = path.join(__dirname, `./config/.env.${NODE_ENV}`);

if (fs.existsSync(envPath)) {
  dotenv.config({
    path: envPath,
  });
} else {
  dotenv.config();
}

// Configure moduleAlias
if (__filename.endsWith('js')) {
  moduleAlias.addAlias('@src', __dirname + '/dist');
}
