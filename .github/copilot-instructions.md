# J2735 Message Viewer - AI Coding Guide

## Project Overview
Full-stack V2X (Vehicle-to-Everything) message visualization tool for decoding J2735 ASN.1 encoded messages. Three-tier architecture:
- **Backend**: NestJS WebSocket server (port 3301) for ASN.1 decoding via Python
- **Frontend**: Vue 3 + Vite with Mapbox GL for geospatial visualization
- **Decoder**: Python service using asn1tools to decode UPER-encoded binary data

## Architecture & Data Flow

### ASN.1 Message Decoding Pipeline
1. **Frontend** → sends hex-encoded message via WebSocket (`decode-map` event with `{ uperData, fileName }`)
2. **AsnGateway** (WebSocket handler) → receives `decode-map`, returns `map-decoded` or `decode-error` events
3. **AsnService** → spawns Python child process: `python/venv/Scripts/python.exe python/decode.py [hex_data]`
4. **Python decoder** → combines all ASN.1 schema files via glob, compiles with `asn1tools.compile_string()`, decodes UPER binary
5. **Response** → JSON with decoded `MessageFrame` structure returned to frontend

**Key Files**:
- [nest/src/asn/asn.gateway.ts](nest/src/asn/asn.gateway.ts) - WebSocket event handlers (`@SubscribeMessage`)
- [nest/src/asn/asn.service.ts](nest/src/asn/asn.service.ts) - Spawns Python process with 10MB buffer (for large MAP data)
- [nest/python/decode.py](nest/python/decode.py) - ASN.1 decoding: loads all `.asn` files, decodes `MessageFrame`

### Message Types Supported
- `MessageFrame` (primary container) from J2735-MessageFrame-2024
- Map data, SPaT, BSM, and other J2735 message types
- All ASN.1 files in `nest/python/asn_files/` are auto-loaded

## Critical Developer Workflows

### Backend Development
```bash
cd nest
npm install                    # First time setup
npm run start:dev             # Watch mode (recommended)
npm run lint                  # Fix ESLint + Prettier
npm run test                  # Unit tests
npm run test:e2e              # E2E tests
```

### Frontend Development
```bash
cd vue
npm install
npm run dev                   # Vite dev server (http://localhost:5173)
npm run build                 # Production build
```

### Python Decoder Development
- Always edit in `nest/python/decode.py`
- Requires `asn1tools` in Python venv: `python -m venv venv && ./venv/Scripts/pip install asn1tools`
- Test locally: `python nest/python/decode.py <hex_string>` (must output valid JSON, no leading/trailing content)
- All `.asn` files must be in `nest/python/asn_files/` (auto-discovered by `decode.py` glob)
- Python uses `BytesEncoder` to convert bytes to hex strings for JSON serialization
- ASN files are combined before `compile_string()` to resolve inter-file dependencies

### Running Full Stack
1. Backend: `npm run start:dev` (watches for changes, port 3301)
2. Frontend: `npm run dev` (auto-reload, port 5173)
3. Set `VITE_MAPBOX_TOKEN` environment variable in frontend (required for Mapbox)
4. WebSocket connects to `ws://localhost:3301`

## Project Patterns & Conventions

### NestJS Module Structure
- **AsnModule** owns all decoding logic (Gateway + Service)
- Controllers are minimal; business logic in Services
- WebSocket communication is event-driven, not HTTP

### Python-Node Integration
- Use `child_process.exec()` with **10MB buffer** (large MAP data)
- Python paths are **absolute** from `process.cwd()`
- Python output must be valid JSON on stdout
- Always handle stderr warnings in logger

### Vue 3 + Pinia State Management
- **mapStore** (Pinia store) holds:
  - Map instance (`mapboxgl.Map`)
  - Intersection/lane data from decoded messages
  - Loading and error states
- **useSocket** composable handles WebSocket subscription
- Components are composable-first with `<script setup>`

### Mapbox GL Integration
- Layers: `lane-lines`, `lane-labels`, `lane-points`, `ref-point`
- Map initialized on component mount with satellite view
- Token required: `VITE_MAPBOX_TOKEN`
- Reference point: `[126.831695, 37.199408]` (default center)

## File Organization

```
nest/
  src/asn/          ← All decoding logic (gateway, service, module)
  python/
    decode.py       ← Main decoder, spawned as child process
    asn_files/      ← All J2735 ASN.1 schema files (auto-loaded)
  test/             ← E2E tests (jest-e2e.json config)

vue/
  src/
    views/MainView.vue  ← Main UI, file list + map + JSON tree
    stores/mapStore.js  ← Pinia store (map state + methods)
    composables/        ← useSocket (WebSocket wrapper)
    components/         ← JsonTree (reusable UI components)
```

## Common Tasks

### Adding a New J2735 Message Type
1. Add `.asn` file to `nest/python/asn_files/`
2. Update `decode.py` if message type needs special parsing
3. Frontend automatically discovers via WebSocket response

### Debugging Decoding Failures
- Check `decode.py` stderr in terminal (warnings logged)
- Verify hex input format: must be valid uppercase hex string
- Test Python decoder directly: `python nest/python/decode.py <hex>`
- Ensure all ASN dependencies are in `asn_files/`

### Adding Frontend Features
- Use Mapbox GL methods on `mapStore.state.map`
- Update `mapStore` for new state (reactive properties)
- Emit WebSocket events via `useSocket().decodeMap(hex, fileName)`

## ESLint & Code Style
- Prettier auto-formats on save
- Run `npm run lint` in `nest/` to fix all style issues
- Config: `eslint.config.mjs` (flat config format)
