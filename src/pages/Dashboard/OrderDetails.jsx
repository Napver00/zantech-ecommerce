import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { config } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Package, MapPin, Receipt, Star } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const OrderDetails = () => {
  const { invoiceCode } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!invoiceCode || !token) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.baseURL}/orders/users/${invoiceCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Order not found or you do not have permission to view it.');
        }
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || 'Could not retrieve order details.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [invoiceCode, token]);

  const handleRatingSubmit = async () => {
    if (rating === 0 || !review.trim()) {
      toast.error("Please provide a rating and a review.");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          star: rating,
          reating: review,
          product_id: selectedProduct.product_id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Thank you for your feedback!");
        // You might want to update the order details to reflect that the product has been rated.
      } else {
        throw new Error(data.message || 'Failed to submit rating.');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getOrderStatusInfo = (status) => {
    switch (String(status)) {
        case '0': return { text: 'Processing', className: 'bg-blue-100 text-blue-800 border-blue-200' };
        case '1': return { text: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' };
        case '2': return { text: 'On Hold', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case '3': return { text: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' };
        case '4': return { text: 'Refunded', className: 'bg-gray-100 text-gray-800 border-gray-200' };
        default: return { text: 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getPaymentStatusInfo = (status) => {
    switch (String(status)) {
        case '0': return { text: 'Unpaid', className: 'bg-red-100 text-red-800 border-red-200' };
        case '1': return { text: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' };
        default: return { text: 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-500" />
        <p className="font-semibold">Could not load order details.</p>
        <p className="text-sm">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  if (!order) return null;

  const orderStatus = getOrderStatusInfo(order.status);
  const paymentStatus = getPaymentStatusInfo(order.payments[0]?.status);

  return (
    <div>
        <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to all orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Order #{order.invoice_code}</h2>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${orderStatus.className}`}>{orderStatus.text}</span>
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${paymentStatus.className}`}>{paymentStatus.text}</span>
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-blue-600"/>Order Items</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {order.order_items.map(item => (
                        <TableRow key={item.product_id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-12 h-12 object-contain rounded-md bg-gray-50" />
                                    <Link to={`/product/${item.slug}`} className="font-medium text-gray-800 hover:text-blue-600 transition-colors">{item.name}</Link>
                                </div>
                            </TableCell>
                            <TableCell>x {item.quantity}</TableCell>
                            <TableCell className="text-right">৳{Number(item.price).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-semibold">৳{(item.quantity * item.price).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedProduct(item)}
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            Rate
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Rate "{selectedProduct?.name}"</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Share your experience with this product.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-6 w-6 cursor-pointer ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                    onClick={() => setRating(i + 1)}
                                                />
                                            ))}
                                        </div>
                                        <Textarea
                                            placeholder="Write your review here..."
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                        />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => { setRating(0); setReview('')}}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleRatingSubmit}>Submit</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600"/>Shipping Address</h3>
                <address className="text-gray-600 not-italic space-y-1">
                    <p className="font-medium text-gray-800">{order.shipping_address.f_name} {order.shipping_address.l_name}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.zip}</p>
                    <p>{order.shipping_address.phone}</p>
                </address>
            </div>
             <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Receipt className="h-5 w-5 text-blue-600"/>Order Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-gray-800">৳{Number(order.item_subtotal).toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium text-gray-800">৳{Number(order.shipping_charge).toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">- ৳{Number(order.discount).toLocaleString()}</span>
                    </div>
                     <div className="border-t border-gray-200 my-2"></div>
                     <div className="flex justify-between text-base font-bold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-blue-600">৳{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default OrderDetails;