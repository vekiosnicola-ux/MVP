# Dieta Positiva: Codebase Guide & Dictionary

## Dictionary of Terms

### Core Concepts
*   **MVP (Minimum Viable Product):** The smallest version of the product that is still valuable. We are building this first.
*   **SaaS (Software as a Service):** The business model (System 2). Users pay a subscription for the software.
*   **Agentic:** Refers to AI systems (Agents) that can take actions (like writing code or querying a database) rather than just chatting.

### Technical Terms
*   **Schema:** A blueprint for data. It forces data to look a certain way (e.g., "Email must be a string containing '@'").
*   **Zod:** A TypeScript library we use to enforce Schemas.
*   **Next.js App Router:** The modern way to build Next.js apps, using folders to define routes.
*   **Supabase:** Our "Backend-in-a-box." It provides the Database, User Login (Auth), and file storage.

## "Where do I find..."

| If you want to find... | Go to... |
| :--- | :--- |
| **New Pages/Routes** | `src/app` |
| **Business Logic** | `src/core` |
| **Database Logic** | `src/core/db` |
| **Data Definitions** | `src/core/contracts` |
| **Global Settings** | `next.config.mjs` or `package.json` |
| **Styling** | `tailwind.config.ts` or `src/app/globals.css` |

## How to navigate the code
1.  **Start at the UI:** Look at `src/app/page.tsx`. This is the homepage.
2.  **Follow the Data:** See where the page gets its data. likely importing a function from `src/core`.
3.  **Check the Contracts:** If you are confused about what a piece of data *is* (e.g., "What is inside a User Profile?"), look for the schema in `src/core/contracts`.

## Learning Questions for NotebookLM
*Use these to test yourself!*
1.  "NotebookLM, explain the difference between System 1 and System 2 in this project."
2.  "What is the role of the 'Orchestrator' in the code architecture?"
3.  "Why do we use schemas in the `src/core/contracts` folder?"
4.  "Explain how a user action flows from the frontend to the database."
