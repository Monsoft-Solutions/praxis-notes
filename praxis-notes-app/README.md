# Monorepo Template

_Well thought-out starting point for a complex full-stack app._

## Getting Started

-   setting things up

    1. install dependencies: `npm i`
    2. initialize local environment: `npm run env`
    3. prepare database: `npm run data`

    > or simply run `npm run init`, which does all of the above

-   running the app

    4. start development server: `npm run dev`
    5. start production server: `npm run start`

## Contributing

Please, read **very carefully** our guidelines before submitting PRs.

## Key Features

-   **End-to-End Type-Safety Tech-Stack**

    -   TypeScript (strictly typed)
    -   Zod (runtime schema validation)
    -   Drizzle ORM (DB operations)
    -   tRPC (API endpoints)
    -   Tanstack Router (client-side routing)
    -   ESLint (Linting)
    -   Prettier (Formatting)

-   **Environment Variables**

    -   env-cmd (on-script)
    -   cross-env (platform-independent)
    -   zod (type-safe)

-   **Authentication & Authorization**

    -   session-based authentication
    -   ABAC authorization

-   **Database (MySQL + Drizzle)**

    -   runtime (drizzle-orm)
    -   migrations (drizzle-kit)
    -   seeding (drizzle-seed)

-   **API (tRPC)**

    -   query
    -   mutation
    -   subscription

-   **Monorepo Architecture**

    -   module-based
    -   shared functionality
    -   consistent conventions
        -   variable names
        -   filesystem hierarchy
        -   filenames + extensions
        -   dependency flow

    ```
    .
    ├── api/                     # endpoints
    ├── auth/                    # authentication
    ├── config/                  # configuration
    ├── css/                     # styling
    ├── db/                      # database
    ├── dist/                    # deployment
    ├── drizzle/                 # database migrations
    ├── env/                     # environment variables
    ├── errors/                  # error-handling
    ├── events/                  # event-handling
    ├── guard/                   # authorization
    ├── log/                     # logging
    ├── package/                 # client package
    ├── routes/                  # client-side routes
    ├── seed/                    # database seeding
    ├── shared/                  # shared functionality
    ├── app/                     # main application code
    │   ├── server/              # express backend
    │   └── web/                 # react+vite frontend
    └── src/                     # core business logic
        ├── template/            # template feature
        │   ├── types/           # typescript types
        │   ├── schemas/         # zod schemas
        │   ├── enums/           # zod enums
        │   ├── hub/             # event listeners
        │   ├── constants/       # constants
        │   ├── utils/           # pure functions
        │   ├── providers/       # impure functions
        │   ├── res/             # resources
        │   ├── components/      # react components
        │   ├── hooks/           # react hooks
        │   ├── views/           # route views
        │   └── ...              # other kinds of functionality
        └── ...                  # other feature modules

    ```

## Scripts

The project includes handy scripts for database-handling, development, and deployment:

-   **Database**

    ```bash
    npm run drop        # drop database
    npm run create      # create database
    npm run generate    # generate migrations
    npm run migrate     # apply migrations
    npm run seed        # seed database
    npm run data        # initialize database (all of the above)
    ```

-   **Development** (watch mode + HMR)

    ```bash
    npm run dev          # start development server
    ```

-   **Deployment**

    ```bash
    npm run app:deploy   # build for production
    npm run app:start    # start production server
    ```
