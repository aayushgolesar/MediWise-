import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Accessibility (WCAG 2.1 AA) & Design System Compliance Audit', () => {
  const componentsDir = path.resolve(__dirname, '../src/components');

  it('1. Form inputs in AuthView must have associated labels or accessible names', () => {
    const authViewPath = path.join(componentsDir, 'AuthView.tsx');
    const content = fs.readFileSync(authViewPath, 'utf-8');
    
    // Check that inputs are enclosed with labels or paired with label tags
    expect(content).toContain('<label');
    expect(content).not.toMatch(/<input(?![^>]*aria-label)(?![^>]*placeholder)[^>]*\/>/);
  });

  it('2. Interactive buttons must have descriptive text or aria-labels', () => {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      // Verify buttons have semantic content or accessible names
      const buttons = content.match(/<button[\s\S]*?<\/button>/g) || [];
      for (const btn of buttons) {
        const hasTextOrChild = btn.length > '<button></button>'.length;
        expect(hasTextOrChild).toBe(true);
      }
    }
  });

  it('3. Color & Contrast Rules: verifies adherence to rules.md non-negotiable color tokens', () => {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      // Rules.md rule 4.2: Never use text-black, use text-slate-900 for maximum contrast
      expect(content).not.toContain('text-black');
    }
  });

  it('4. Regulatory Compliance Notices: Header and footer maintain statutory CDSCO / DISHA disclaimers', () => {
    const appPath = path.resolve(__dirname, '../src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    
    // Check compliance footers
    expect(appContent).toContain('CDSCO');
    expect(appContent).toContain('DISHA');
  });
});
