import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', '..', 'dist');

describe('static build smoke — simulator page', () => {
  it('dist directory exists after build', () => {
    expect(existsSync(distDir)).toBe(true);
  });

  it('simulator index.html is a static HTML file', () => {
    const indexPath = join(distDir, 'simulator', 'index.html');
    expect(existsSync(indexPath)).toBe(true);

    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('</html>');
  });

  it('simulator index.html contains the SimulatorApp component output', () => {
    const indexPath = join(distDir, 'simulator', 'index.html');
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('data-testid="simulator-app"');
    expect(content).toContain('FlexSavvy Simulator');
  });

  it('dist contains only static files (no .mjs server handlers)', () => {
    const entries = readdirSync(distDir, { recursive: true }) as string[];
    for (const entry of entries) {
      const name = basename(entry);
      expect(name.endsWith('.mjs')).toBe(false);
    }
  });

  it('simulator page links to a client-side JS bundle', () => {
    const indexPath = join(distDir, 'simulator', 'index.html');
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toMatch(/component-url="[^"]*\.js"/);
  });
});
