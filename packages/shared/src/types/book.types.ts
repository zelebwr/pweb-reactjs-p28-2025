import type { Genre } from "./genre.types";

// We must redefine the Enum from Prisma so the client can use it
export enum BookCondition {
    NEW = "NEW",
    LIKE_NEW = "LIKE_NEW",
    USED = "USED",
}

// Database model representation of a Book
export interface Book {
    id: string;
    title: string;
    writer: string;
    publisher: string;
    publicationYear: number;
    description: string | null;
    price: number;
    stockQuantity: number;
    condition: BookCondition;
    genreId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Api response type for Book with Genre details
export interface BookWithGenre extends Book {
    genre: Genre;
}
