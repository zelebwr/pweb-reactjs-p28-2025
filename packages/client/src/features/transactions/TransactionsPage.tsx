import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { getAllTransactions } from '../cart/api/transactionsApi';
import type { ApiTransaction, TransactionStatus } from '@react-express-library/shared';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  PENDING: '⏳ Pending',
  PAID: '💳 Paid',
  SENDING: '🚚 Sending',
  COMPLETED: '✅ Completed',
  CANCELED: '❌ Canceled',
};

export function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const limit = 10;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const query: any = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (searchId.trim()) query.search = searchId.trim();
      if (statusFilter) query.status = statusFilter;
      
      if (sortBy === 'date') query.orderByDate = sortOrder;
      if (sortBy === 'amount') query.orderByAmount = sortOrder;
      if (sortBy === 'price') query.orderByPrice = sortOrder;

      const result = await getAllTransactions(query);
      setTransactions(result.transactions);
      setTotalPages(Math.ceil(result.total / limit));
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setSearchId('');
    setStatusFilter('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg text-medium-blue">Loading transactions...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark-blue">Transaction History</h1>
          <Button onClick={() => navigate('/books')}>
            Browse Books
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-sky-blue">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              label="Search by Transaction ID"
              type="text"
              placeholder="Enter transaction ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as TransactionStatus | '');
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'PAID', label: 'Paid' },
                { value: 'SENDING', label: 'Sending' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELED', label: 'Canceled' },
              ]}
            />

            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'amount' | 'price');
                setPage(1);
              }}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'amount', label: 'Total Items' },
                { value: 'price', label: 'Total Price' },
              ]}
            />

            <Select
              label="Order"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc');
                setPage(1);
              }}
              options={[
                { value: 'desc', label: 'Descending' },
                { value: 'asc', label: 'Ascending' },
              ]}
            />
          </form>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" onClick={handleSearch}>
              🔍 Search
            </Button>
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🧾</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No transactions found</h3>
            <p className="text-gray-600 mb-6">
              {searchId || statusFilter ? 'Try adjusting your filters' : 'Start shopping to see your purchase history'}
            </p>
            <Button onClick={() => navigate('/books')}>
              Browse Books
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/transactions/${transaction.id}`)}
                className="bg-white rounded-lg shadow-md p-6 border border-sky-blue hover:border-medium-blue hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-dark-blue mb-1">
                      Transaction #{transaction.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[transaction.status]}`}>
                    {STATUS_LABELS[transaction.status]}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-lg font-bold text-dark-blue">{transaction.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="text-lg font-bold text-dark-blue">{formatPrice(transaction.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Books</p>
                    <p className="text-sm text-gray-800">
                      {transaction.books.slice(0, 2).map(b => b.book.title).join(', ')}
                      {transaction.books.length > 2 && ` +${transaction.books.length - 2} more`}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">
                    View Details →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </Button>
            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
