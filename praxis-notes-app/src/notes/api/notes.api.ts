import { endpoints } from '@api/providers/server';

// queries

// mutations
import { generateNotes } from './generate-notes.mutation';
import { updateNotes } from './update-notes.mutation';
import { translateNotes } from './translate-notes.mutation';
import { transformNotes } from './transform-notes.mutation';

// subscriptions
import { onNotesUpdated } from './notes-updated.subscription';

export const notes = endpoints({
    // queries

    // mutations
    generateNotes,
    updateNotes,
    translateNotes,
    transformNotes,

    // subscriptions
    onNotesUpdated,
});
