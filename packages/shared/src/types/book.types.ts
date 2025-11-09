// packages/shared/src/types/book.types.ts

// Import types directly from the Prisma client.
// This ensures that if you change your schema.prisma, these types update.
import { Book, BookCondition } from "@prisma/client";

// ----------------------------------------------------------------
// --- Frontend -> Server (Data Sent TO the Backend) ---
// ----------------------------------------------------------------

/**
 * Data required for the "Add New Book" form.
 * [cite_start]This is what the frontend sends to POST /books[cite: 77].
 * We use Omit<> to base it on the Prisma 'Book' model, but
 * exclude fields the database generates itself.
 * This automatically includes the new 'condition' field.
 */
export type CreateBookInput = Omit<
    Book,
    "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

/**
 * Data required for the "Edit Book" form.
 * This is what the frontend sends to PATCH /books/:id.
 * The practicum documentation specifies only these fields are
 * editable.
 * - Pick<> ensures only these fields can be chosen.
 * - Partial<> makes them all optional (so you can update just one).
 */
export type UpdateBookInput = Partial<
    Pick<Book, "description" | "price" | "stockQuantity">
>;

// ----------------------------------------------------------------
// --- Server -> Frontend (Data Sent FROM the Backend) ---
// ----------------------------------------------------------------

/**
 * Represents the shape of a book object as returned by the API.
 * This is the "safe" data your React components will receive and display.
 */
export interface ApiBook {
    id: string;
    title: string;
    writer: string;
    publisher: string;
    publicationYear: number;
    description: string | null;
    price: number;
    stockQuantity: number;
    /**
     * We include the 'condition' from the schema.
     */
    condition: BookCondition;
    /**
     * Note: This is 'string'. This is because your book.service.ts
     * correctly formats the data to return only the genre *name*,
     * not the full genre object.
     */
    genre: string;
}

// ----------------------------------------------------------------
// --- Shared Enums (Used by BOTH Frontend and Backend) ---
// ----------------------------------------------------------------

/**
 * Re-exporting the BookCondition enum from the Prisma client.
 * - The Backend uses this for validation and database queries.
 * - The Frontend uses this to build the "Filter by condition"
 * [cite_start]dropdown menu[cite: 34].
 */
export { BookCondition };
