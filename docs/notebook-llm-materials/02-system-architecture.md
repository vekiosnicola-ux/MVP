# Dieta Positiva: System Architecture & Technical Deep Dive

## The Tech Stack
We have chosen "boring," stable, and high-performance technologies:
*   **Framework:** Next.js 14 (App Router).
*   **Language:** TypeScript (Strict typing).
*   **Styling:** Tailwind CSS.
*   **Database:** Supabase (PostgreSQL).
*   **Deployment:** Vercel.

## The Folder Structure
The codebase is organized to separate **Interface** from **Business Logic**.

### 1. `src/app` (The Interface)
This is standard Next.js. It contains the visual layer.
*   **Routes:** `page.tsx` files define URLs.
*   **Layouts:** `layout.tsx` defines the wrapper (UI, headers) for pages.
*   **Purpose:** To display data and capture user input. It should contain *minimal* logic.

### 2. `src/core` (The Brains) 🧠
This is where the magic happens. It is decoupled from the UI, meaning we could theoretically swap out Next.js for a different framework and keep this logic.
*   **`/contracts`**: JSON Schemas (`*.schema.json`) that strictly define data structures (e.g., "What exactly is a Diet Plan?"). This represents a "Schema-First" approach.
*   **`/orchestrator`**: The manager. It handles complex workflows, like "Generate a Meal Plan," ensuring quality gates are met.
*   **`/validators`**: Uses `zod` to enforce the schemas defined in `/contracts`. It stops bad data at the door.
*   **`/db`**: Direct database interactions.

## Key Design Patterns

### Schema-First Design
Instead of writing code and hoping data matches, we define **Contracts** first.
*   *Example:* `src/core/contracts/plan.schema.json` likely defines exactly what a "Plan" looks like.
*   **Benefit:** AI Agents (like Claude) are very good at following schemas. This makes generating valid data much easier.

### The Orchestrator Pattern
Found in `src/core/orchestrator`.
*   Complex tasks (like creating a personalized diet) aren't just one function. They are a workflow.
*   **Quality Gates:** The orchestrator likely checks data at multiple steps (e.g., "Is this diet actually 2000 calories?") before saving it.
*   **Workflow:** Segregating the "process" of a task from the "data" of a task.

## Data Flow Example
1.  **User Action:** User clicks "Generate Plan" on the frontend (`src/app`).
2.  **API Call:** The app calls an API route (`src/app/api/...`).
3.  **Orchestrator:** The API calls the `DietOrchestrator` in `src/core/orchestrator`.
4.  **Validation:** Input is checked against `validators`.
5.  **Logic/AI:** The system calculates the plan (potentially using AI).
6.  **Database:** validated result is saved via `src/core/db`.
7.  **Response:** User sees the plan.
