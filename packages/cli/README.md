# create-start-kit

CLI for scaffolding and configuring [Start Kit](https://github.com/CarlosZiegler/start-kit.dev) projects.

## Usage

### Create a new project

```bash
bunx create-start-kit create my-app
```

This downloads the template, installs dependencies, and runs the interactive setup wizard.

### Initialize an existing project

```bash
bunx create-start-kit init
```

### Run a specific setup phase

```bash
bunx create-start-kit init --step database
```

## Setup Phases

The wizard guides you through these phases (resumable if interrupted):

| Phase | What it does |
|-------|-------------|
| **Branding** | App name, description, logo, colors |
| **Features** | Toggle AI, payments, storage, i18n |
| **Database** | PostgreSQL connection and schema setup |
| **Environment** | Generate `.env` with required variables |
| **Infrastructure** | Docker and deployment config |

## Development

```bash
bun install
bun run build    # Build with tsdown
bun run dev      # Watch mode
```

## License

MIT
