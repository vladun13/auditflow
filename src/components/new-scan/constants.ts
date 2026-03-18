export const DEPTH_OPTIONS = [
  { value: 1, label: '1 page', description: 'Quick check' },
  { value: 2, label: '2 pages', description: 'Light Scan' },
  { value: 3, label: '3 pages', description: 'Standard Scan' },
  { value: 4, label: '4 pages', description: 'Deep Scan' },
  { value: 5, label: '5 pages', description: 'Full Scan' },
]

export const STANDARDS = [
  { id: 'wcag21', label: 'WCAG 2.1', description: 'Web Content Accessibility Guidelines 2.1' },
  { id: 'wcag22', label: 'WCAG 2.2', description: 'Web Content Accessibility Guidelines 2.2' },
  { id: 'ada',    label: 'ADA',      description: 'Americans with Disabilities Act' },
  { id: 'eaa',    label: 'EAA',      description: 'European Accessibility Act' },
  { id: 'section508', label: 'Section 508', description: 'US Federal accessibility standard' },
  { id: 'aoda',   label: 'AODA',     description: 'Accessibility for Ontarians with Disabilities Act' },
]

export const CHECKS = [
  'WCAG 2.1 Level A, AA & AAA compliance',
  'Color contrast and visual accessibility',
  'Missing alt text and ARIA labels',
  'Keyboard navigation and focus management',
  'Form labels and input accessibility',
  'Heading structure and landmarks',
]
