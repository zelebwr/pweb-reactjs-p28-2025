import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components';
import type { ApiBook } from '@react-express-library/shared';

interface BookCardProps {
  book: ApiBook;
}

const conditionColors = {
  NEW: 'bg-green-100 text-green-800',
  LIKE_NEW: 'bg-blue-100 text-blue-800',
  USED: 'bg-yellow-100 text-yellow-800',
};

const conditionLabels = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  USED: 'Used',
};

export const BookCard = ({ book }: BookCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card hover onClick={() => navigate(`/books/${book.id}`)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-dark-blue line-clamp-2 flex-1">
            {book.title}
          </h3>
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              conditionColors[book.condition]
            }`}
          >
            {conditionLabels[book.condition]}
          </span>
        </div>

        {/* Author & Publisher */}
        <div className="space-y-1 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Author:</span> {book.writer}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Publisher:</span> {book.publisher}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Year:</span> {book.publicationYear}
          </p>
        </div>

        {/* Genre Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-sky-blue text-white text-xs font-medium rounded-full">
            {book.genre}
          </span>
        </div>

        {/* Price & Stock */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            <p className="text-2xl font-bold text-dark-blue">{formatPrice(book.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Stock</p>
            <p
              className={`text-lg font-bold ${
                book.stockQuantity > 10
                  ? 'text-green-600'
                  : book.stockQuantity > 0
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {book.stockQuantity}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
