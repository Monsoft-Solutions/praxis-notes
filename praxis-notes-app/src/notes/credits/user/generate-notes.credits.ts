import { int } from '@db/sql';

// generate notes user credits
export const generateNotesUserCredits = {
    // session-notes generation
    generateNotes: int('generate_notes').notNull(),
};
