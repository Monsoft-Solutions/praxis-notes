// Predefined suggestion types that users can select from
export const SUGGESTION_TYPES = [
    { value: 'feature', label: 'New Feature' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'ux', label: 'User Experience' },
    { value: 'performance', label: 'Performance' },
    { value: 'other', label: 'Other' },
] as const;

// Predefined bug severity levels
export const BUG_SEVERITY = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
] as const;

// Application areas where bugs might occur
export const APP_AREAS = [
    { value: 'notes', label: 'Notes' },
    { value: 'auth', label: 'Authentication' },
    { value: 'ui', label: 'User Interface' },
    { value: 'sync', label: 'Synchronization' },
    { value: 'search', label: 'Search' },
    { value: 'other', label: 'Other' },
] as const;
