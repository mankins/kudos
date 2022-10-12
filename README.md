# Kudos Starter

A monorepo for exploring the Kudos Protocol.

## What's inside?

This repo uses [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps

- `cli`: cli interface to kudos
- `recorder`: parse for contributions
- `fulfill`: send kudos ledger for publication

### Packages

- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `ui-TKTK`: a library to share ui components
- `kudos-lib`: library to aid in kudos development 


### Build

To build all apps and packages, run the following command:

```
pnpm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm run dev
```

