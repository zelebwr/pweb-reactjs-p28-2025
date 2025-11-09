// packages/shared/src/types/genre.types.ts

// Import the base 'Genre' model type from Prisma
import { Genre } from "@prisma/client";

// ----------------------------------------------------------------
// --- Frontend -> Server (Data Sent TO the Backend) ---
// ----------------------------------------------------------------

/**
 * Data required for the "Create Genre" form.
 * This is what the frontend sends to POST /genre.
 * Based on your API, only a 'name' is needed.
 */
export type CreateGenreInput = Pick<Genre, "name">;

/**
 * Data required for the "Update Genre" form.
 * This is what the frontend sends to PATCH /genre/:id.
 * Based on your API, only a 'name' is needed.
 */
export type UpdateGenreInput = Pick<Genre, "name">;

// ----------------------------------------------------------------
// --- Server -> Frontend (Data Sent FROM the Backend) ---
// ----------------------------------------------------------------

/**
 * Represents the *minimal* genre data returned in a list.
 * This is what the backend sends from GET /genre for the "Get All Genres" list.
 * Your service layer specifically selects only id and name.
 * This is perfect for populating the "Add Book" form's dropdown!
 */
export interface ApiGenre {
    id: string;
    name: string;
}

/**
 * Represents the *full* genre data returned as a single item.
 * This is what the backend sends from:
 * - POST /genre (on success)
 * - GET /genre/:id (for detail page)
 * - PATCH /genre/:id (on success)
 * We Omit 'deletedAt' as it's a private field not needed by the client.
 */
export type ApiGenreDetail = Omit<Genre, "deletedAt">;

/**
 * The full response object from the GET /genre (Get All) endpoint.
 * Your React component will use this to get the list of genres
 * and the pagination data.
 */
export interface ApiGetAllGenresResponse {
    data: ApiGenre[];
    meta: {
        page: number;
        limit: number;
        total: number;
        next_page: number | null;
        prev_page: number | null;
    };
}
