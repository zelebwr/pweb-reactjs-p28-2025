// packages/shared/src/types/transaction.types.ts

// Import other shared types that we will nest inside these types
import { PublicUser } from "@react-express-library/shared";

// ----------------------------------------------------------------
// --- Frontend -> Server (Data Sent TO the Backend) ---
// ----------------------------------------------------------------

/**
 * Represents a single item in the user's "shopping cart".
 * This is the format your transaction service expects in its array.
 */
export interface BookOrderItem {
    bookId: string;
    quantity: number;
}

/**
 * Data required for the "Create Transaction" (Checkout) request.
 * This is what the frontend sends to POST /transactions.
 * It's an object containing the array of items.
 *
 * NOTE: The 'userId' is NOT included here. The backend should
 * securely get the 'userId' from the 'authMiddleware' (req.user.id)
 * instead of trusting the request body.
 */
export interface CreateTransactionInput {
    books: BookOrderItem[];
}

// ----------------------------------------------------------------
// --- Server -> Frontend (Data Sent FROM the Backend) ---
// ----------------------------------------------------------------

/**
 * The minimal response data sent after a successful checkout.
 * This matches the return value of your 'createTransaction' service.
 */
export interface CreateTransactionResponse {
    transaction_id: string;
    total_quantity: number;
    total_price: number;
}

/**
 * Represents a book item within a transaction list.
 * This is a minimal book object, as defined in your
 * 'getAllTransactions' service.
 */
interface ApiTransactionBookItem {
    quantity: number;
    book: {
        id: string;
        title: string;
        price: number;
    };
}

/**
 * Represents a single transaction in the "Order History" list.
 * This is the shape returned by GET /transactions.
 * It includes the minimal user and book item data.
 */
export interface ApiTransaction {
    id: string;
    totalPrice: number;
    totalAmount: number;
    createdAt: string; // or Date, depending on JSON serialization
    user: PublicUser;
    books: ApiTransactionBookItem[];
}

/**
 * The full response object from the GET /transactions (Get All) endpoint.
 * Your React component will use this to get the list of transactions
 * and the pagination data.
 */
export interface ApiGetAllTransactionsResponse {
    data: ApiTransaction[];
    meta: {
        page: number;
        limit: number;
        total: number;
        next_page: number | null;
        prev_page: number | null;
    };
}

/**
 * Represents a book item within a "Transaction Detail" view.
 * This contains *more* book details (like 'writer') than the list,
 * matching your 'getTransactionById' service.
 */
interface ApiTransactionDetailBookItem {
    quantity: number;
    book: {
        id: string;
        title: string;
        writer: string;
        price: number;
    };
}

/**
 * Represents the full "Transaction Detail" object.
 * This is the shape returned by GET /transactions/:id.
 * It includes the full user and detailed book item data.
 */
export interface ApiTransactionDetail {
    id: string;
    totalPrice: number;
    totalAmount: number;
    createdAt: string; // or Date
    user: PublicUser;
    books: ApiTransactionDetailBookItem[];
}

/**
 * Represents the data returned by the GET /transactions/statistics endpoint.
 * This matches the return object from your 'getTransactionStatistics' service.
 */
export interface ApiTransactionStatistics {
    total_transactions: number;
    average_transaction_amount: number;
    fewest_book_sales_genre: string | null;
    most_book_sales_genre: string | null;
}
