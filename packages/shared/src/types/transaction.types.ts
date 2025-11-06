import type { Book } from "./book.types";

// ---- For Creating a New Transaction ----

// What client will seand for EACH item in the transaction
export interface CreateTransactionItemData {
    bookId: string;
    quantity: number;
}

// Body for POST /transactions endpoint
export interface CreateTransactionData {
    items: CreateTransactionItemData[];
}

// ---- For Viewing Existing Transactions ----

// Singlet item returned in a Transaction
export interface TransactionItem {
    id: string;
    quantity: number;
    book: Book; // Send the full book details
}

// Full transaction object for /transactions/:id
export interface Transaction {
    id: string;
    userId: string;
    totalPrice: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    books: TransactionItem[];
}
