import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { App } from './app';

// get element to mount app root component into
const rootElement = document.getElementById('app');

// if element exists and is empty
// mount app root component into it
if (rootElement && !rootElement.innerHTML) {
    // create react root
    const root = createRoot(rootElement);

    // render app root component
    root.render(
        // use strict mode to detect potential issues in development
        // not used in production
        <StrictMode>
            {/* app root component */}
            <App />
        </StrictMode>,
    );
}
