import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Toast, type ToastType } from '../../components/Toast/Toast';
import { useCart } from './contexts/CartContext';
import { createTransaction } from './api/transactionsApi';
import { PaymentMethod } from '@react-express-library/shared';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

export function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping form data
  const [shippingData, setShippingData] = useState({
    address: '',
    phone: '',
  });

  // Payment form data
  const [paymentData, setPaymentData] = useState({
    method: '' as PaymentMethod | '',
    bankAccount: '',
  });

  // Form errors
  const [errors, setErrors] = useState({
    address: '',
    phone: '',
    method: '',
    bankAccount: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (bookId: string, newQuantity: number) => {
    try {
      updateQuantity(bookId, newQuantity);
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleRemove = (bookId: string, title: string) => {
    if (window.confirm(`Remove "${title}" from cart?`)) {
      removeFromCart(bookId);
      setToast({ message: 'Item removed from cart', type: 'info' });
    }
  };

  // Validate shipping form
  const validateShipping = (): boolean => {
    const newErrors = { ...errors };
    
    newErrors.address = !shippingData.address.trim() ? 'Address is required' : '';
    
    if (!shippingData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(shippingData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Invalid phone number format (e.g., 08123456789)';
    } else {
      newErrors.phone = '';
    }

    setErrors(newErrors);
    return !newErrors.address && !newErrors.phone;
  };

  // Validate payment form
  const validatePayment = (): boolean => {
    const newErrors = { ...errors };
    
    newErrors.method = !paymentData.method ? 'Please select a payment method' : '';
    
    if (['BCA', 'MANDIRI', 'BNI'].includes(paymentData.method) && !paymentData.bankAccount.trim()) {
      newErrors.bankAccount = 'Bank account number is required for bank transfer';
    } else {
      newErrors.bankAccount = '';
    }

    setErrors(newErrors);
    return !newErrors.method && !newErrors.bankAccount;
  };

  const handleProceedToShipping = () => {
    if (items.length === 0) {
      setToast({ message: 'Your cart is empty', type: 'error' });
      return;
    }
    setCurrentStep('shipping');
  };

  const handleProceedToPayment = () => {
    if (validateShipping()) {
      setCurrentStep('payment');
    }
  };

  const handleProceedToConfirmation = () => {
    if (validatePayment()) {
      setCurrentStep('confirmation');
    }
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const transactionData = {
        books: items.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingData.address,
        phoneNumber: shippingData.phone,
        paymentMethod: paymentData.method as PaymentMethod,
        bankAccount: ['BCA', 'MANDIRI', 'BNI'].includes(paymentData.method) ? paymentData.bankAccount : undefined,
      };

      await createTransaction(transactionData);
      
      clearCart();
      setToast({ message: 'Order placed successfully!', type: 'success' });
      
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to place order:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to place order. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty cart state
  if (items.length === 0 && currentStep === 'cart') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Browse our collection and add some books!</p>
            <Button onClick={() => navigate('/books')}>
              Browse Books
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {['cart', 'shipping', 'payment', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  currentStep === step 
                    ? 'bg-dark-blue text-white' 
                    : ['cart', 'shipping', 'payment', 'confirmation'].indexOf(currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {['cart', 'shipping', 'payment', 'confirmation'].indexOf(currentStep) > index ? '✓' : index + 1}
                </div>
                <span className={`ml-2 font-medium capitalize hidden sm:inline ${
                  currentStep === step ? 'text-dark-blue' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    ['cart', 'shipping', 'payment', 'confirmation'].indexOf(currentStep) > index 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Cart Items */}
        {currentStep === 'cart' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-dark-blue mb-6">Shopping Cart ({getTotalItems()} items)</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.bookId} className="bg-white rounded-lg shadow-md p-4 border border-sky-blue">
                  <div className="flex gap-4">
                    {/* Book Image */}
                    <div className="w-24 h-32 flex-shrink-0">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-medium-blue to-dark-blue rounded flex items-center justify-center text-white text-4xl">
                          📚
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-dark-blue mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {item.writer}</p>
                      <p className="text-xl font-bold text-dark-blue">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-500">Stock: {item.stock}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.bookId, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center font-bold"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.bookId, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center font-bold"
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-lg font-bold text-dark-blue">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => handleRemove(item.bookId, item.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout Button */}
            <div className="bg-cream rounded-lg p-6 border-2 border-sky-blue">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-700">Total:</span>
                <span className="text-3xl font-bold text-dark-blue">{formatPrice(getTotalPrice())}</span>
              </div>
              <Button
                variant="primary"
                onClick={handleProceedToShipping}
                className="w-full"
              >
                Proceed to Shipping →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Shipping Information */}
        {currentStep === 'shipping' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-dark-blue mb-6">Shipping Information</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue space-y-4">
              <Input
                label="Shipping Address"
                type="text"
                placeholder="Enter your full address"
                value={shippingData.address}
                onChange={(e) => {
                  setShippingData({ ...shippingData, address: e.target.value });
                  setErrors({ ...errors, address: '' });
                }}
                error={errors.address}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="08123456789"
                value={shippingData.phone}
                onChange={(e) => {
                  setShippingData({ ...shippingData, phone: e.target.value });
                  setErrors({ ...errors, phone: '' });
                }}
                error={errors.phone}
                required
              />

              <div className="flex gap-4 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep('cart')}
                  className="flex-1"
                >
                  ← Back to Cart
                </Button>
                <Button
                  variant="primary"
                  onClick={handleProceedToPayment}
                  className="flex-1"
                >
                  Continue to Payment →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Method */}
        {currentStep === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-dark-blue mb-6">Payment Method</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue space-y-4">
              <Select
                label="Select Payment Method"
                value={paymentData.method}
                onChange={(e) => {
                  setPaymentData({ ...paymentData, method: e.target.value as PaymentMethod, bankAccount: '' });
                  setErrors({ ...errors, method: '', bankAccount: '' });
                }}
                options={[
                  { value: '', label: 'Choose payment method' },
                  { value: PaymentMethod.GOPAY, label: '💳 GoPay' },
                  { value: PaymentMethod.SHOPEEPAY, label: '🛍️ ShopeePay' },
                  { value: PaymentMethod.BCA, label: '🏦 BCA Bank Transfer' },
                  { value: PaymentMethod.MANDIRI, label: '🏦 Mandiri Bank Transfer' },
                  { value: PaymentMethod.BNI, label: '🏦 BNI Bank Transfer' },
                  { value: PaymentMethod.COD, label: '💵 Cash on Delivery (COD)' },
                ]}
                error={errors.method}
                required
              />

              {['BCA', 'MANDIRI', 'BNI'].includes(paymentData.method) && (
                <Input
                  label="Bank Account Number"
                  type="text"
                  placeholder="Enter your bank account number"
                  value={paymentData.bankAccount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    setPaymentData({ ...paymentData, bankAccount: value });
                    setErrors({ ...errors, bankAccount: '' });
                  }}
                  error={errors.bankAccount}
                  required
                />
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep('shipping')}
                  className="flex-1"
                >
                  ← Back to Shipping
                </Button>
                <Button
                  variant="primary"
                  onClick={handleProceedToConfirmation}
                  className="flex-1"
                >
                  Review Order →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-dark-blue mb-6">Order Confirmation</h2>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
                <h3 className="text-lg font-bold text-dark-blue mb-4">Order Summary</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex justify-between text-sm">
                      <span>{item.title} x {item.quantity}</span>
                      <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-dark-blue">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
                <h3 className="text-lg font-bold text-dark-blue mb-4">Shipping Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{shippingData.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{shippingData.phone}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-sky-blue">
                <h3 className="text-lg font-bold text-dark-blue mb-4">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <p className="font-medium">{paymentData.method}</p>
                  </div>
                  {paymentData.bankAccount && (
                    <div>
                      <span className="text-gray-600">Bank Account:</span>
                      <p className="font-medium">{paymentData.bankAccount}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Place Order Button */}
              <form onSubmit={handlePlaceOrder}>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentStep('payment')}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    ← Back to Payment
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : '✓ Place Order'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={3000}
          />
        )}
      </div>
    </MainLayout>
  );
}
