import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/Button/Button';
import { getTransactionById } from '../cart/api/transactionsApi';
import type { ApiTransactionDetail } from '@react-express-library/shared';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  PENDING: '⏳ Pending Payment',
  PAID: '💳 Payment Confirmed',
  SENDING: '🚚 On Delivery',
  COMPLETED: '✅ Completed',
  CANCELED: '❌ Canceled',
};

const PAYMENT_LABELS = {
  GOPAY: '💳 GoPay',
  SHOPEEPAY: '🛍️ ShopeePay',
  BCA: '🏦 BCA Bank Transfer',
  MANDIRI: '🏦 Mandiri Bank Transfer',
  BNI: '🏦 BNI Bank Transfer',
  COD: '💵 Cash on Delivery',
};

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<ApiTransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        setError('Transaction ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getTransactionById(id);
        setTransaction(data);
      } catch (err: any) {
        console.error('Failed to fetch transaction:', err);
        setError(err.response?.data?.message || 'Failed to load transaction details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg text-medium-blue">Loading transaction details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !transaction) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Transaction Not Found</h3>
              <p className="text-gray-600 mb-4">{error || 'The transaction you are looking for does not exist.'}</p>
              <Button onClick={() => navigate('/transactions')}>
                Back to Transactions
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/transactions')}>
            ← Back to Transactions
          </Button>
        </div>

        {/* Transaction Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-sky-blue">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue mb-2">
                Transaction #{transaction.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600">{formatDate(transaction.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-lg font-semibold ${STATUS_COLORS[transaction.status]}`}>
              {STATUS_LABELS[transaction.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
              <h2 className="text-xl font-bold text-dark-blue mb-4">Order Items</h2>
              <div className="space-y-4">
                {transaction.books.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-cream rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-bold text-dark-blue">{item.book.title}</h3>
                      <p className="text-sm text-gray-600">by {item.book.writer}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.book.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-dark-blue">
                        {formatPrice(item.book.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold">{formatPrice(transaction.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-bold">{transaction.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-xl pt-2 border-t border-gray-300">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-dark-blue">{formatPrice(transaction.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
              <h2 className="text-xl font-bold text-dark-blue mb-4">🚚 Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address:</p>
                  <p className="font-medium text-gray-800">{transaction.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number:</p>
                  <p className="font-medium text-gray-800">{transaction.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
              <h2 className="text-xl font-bold text-dark-blue mb-4">💳 Payment Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method:</p>
                  <p className="font-medium text-gray-800">
                    {PAYMENT_LABELS[transaction.paymentMethod as keyof typeof PAYMENT_LABELS]}
                  </p>
                </div>
                {transaction.bankAccount && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bank Account:</p>
                    <p className="font-medium text-gray-800">{transaction.bankAccount}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status:</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[transaction.status]}`}>
                    {STATUS_LABELS[transaction.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
              <h2 className="text-xl font-bold text-dark-blue mb-4">👤 Customer Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name:</p>
                  <p className="font-medium text-gray-800">{transaction.user.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-medium text-gray-800">{transaction.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
