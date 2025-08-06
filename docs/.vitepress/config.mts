import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Praxis Notes Docs',
    description: 'Documentation about the Praxis Notes app',
    sitemap: {
        hostname: 'https://docs.praxisnotes.com',
    },
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            {
                text: 'Introduction',
                link: '/introduction/what-is-praxis-notes',
            },
            { text: 'Clients', link: '/clients/managing-clients' },
            {
                text: 'Session Notes',
                link: '/clients/session-list',
            },
            {
                text: 'Billing',
                link: '/billing/credits',
            },
        ],

        sidebar: [
            {
                text: 'Introduction',
                items: [
                    {
                        text: 'What is Praxis Notes?',
                        link: '/introduction/what-is-praxis-notes',
                    },
                    {
                        text: 'How to Start?',
                        link: '/introduction/how-to-start',
                    },
                ],
            },
            {
                text: 'Client Management',
                items: [
                    {
                        text: 'Managing Clients',
                        link: '/clients/managing-clients',
                    },
                    {
                        text: 'Adding New Clients',
                        link: '/clients/adding-new-clients',
                    },
                    {
                        text: 'Managing Client Sessions',
                        link: '/clients/client-sessions',
                    },
                ],
            },
            {
                text: 'Session Notes',
                items: [
                    {
                        text: 'Viewing Client Sessions',
                        link: '/clients/session-list',
                    },
                    {
                        text: 'Creating Session Notes',
                        link: '/clients/session-create',
                    },
                    {
                        text: 'Viewing and Editing Notes',
                        link: '/clients/session-view-edit',
                    },
                ],
            },
            {
                text: 'Billing',
                items: [
                    {
                        text: 'Credits System',
                        link: '/billing/credits',
                    },
                ],
            },
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
        ],
    },

    locales: {
        root: {
            label: 'English',
            lang: 'en',
        },
        es: {
            label: 'Español',
            lang: 'es',
            link: '/es/',
            themeConfig: {
                nav: [
                    { text: 'Inicio', link: '/es/' },
                    {
                        text: 'Introducción',
                        link: '/es/introduction/what-is-praxis-notes',
                    },
                    { text: 'Clientes', link: '/es/clients/managing-clients' },
                    {
                        text: 'Facturación',
                        link: '/es/billing/credits',
                    },
                ],
                sidebar: [
                    {
                        text: 'Introducción',
                        items: [
                            {
                                text: '¿Qué es Praxis Notes?',
                                link: '/es/introduction/what-is-praxis-notes',
                            },
                            {
                                text: '¿Cómo Comenzar?',
                                link: '/es/introduction/how-to-start',
                            },
                        ],
                    },
                    {
                        text: 'Gestión de Clientes',
                        items: [
                            {
                                text: 'Gestión de Clientes y Sesiones',
                                link: '/es/clients/managing-clients',
                            },
                            {
                                text: 'Añadir Nuevos Clientes',
                                link: '/es/clients/adding-new-clients',
                            },
                            {
                                text: 'Gestión de Sesiones de Clientes',
                                link: '/es/clients/client-sessions',
                            },
                        ],
                    },
                    {
                        text: 'Notas de Sesión',
                        items: [
                            {
                                text: 'Visualización de Sesiones de Clientes',
                                link: '/es/clients/session-list',
                            },
                            {
                                text: 'Creación de Notas de Sesión',
                                link: '/es/clients/session-create',
                            },
                            {
                                text: 'Visualización y Edición de Notas',
                                link: '/es/clients/session-view-edit',
                            },
                        ],
                    },
                    {
                        text: 'Facturación',
                        items: [
                            {
                                text: 'Sistema de Créditos',
                                link: '/es/billing/credits',
                            },
                        ],
                    },
                ],
            },
        },
    },
});
