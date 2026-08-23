import React, { useState, useEffect } from 'react';
import { Heart, Loader2, Trash2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const Wishlist = () => {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_rows: 0,
    current_page: 1,
    per_page: 3,
    total_pages: 1,
    has_more_pages: false
  });

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [currentPage]);

  const fetchWishlist = async (page = 1) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${config.baseURL}/wishlist?limit=3&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setWishlistItems(data.data || []);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to load wishlist.');
      }
    } catch (err) {
      setError('An error occurred while loading your wishlist.');
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (wishlistId) => {
    if (!window.confirm('Remove this item from your wishlist?')) {
      return;
    }

    setIsRemoving(wishlistId);
    setError('');

    try {
      const response = await fetch(`${config.baseURL}/wishlist/${wishlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the wishlist
        fetchWishlist(currentPage);
      } else {
        setError(data.message || 'Failed to remove item.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsRemoving(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && wishlistItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="h-6 w-6 text-red-600" />
          My Wishlist
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {pagination.total_rows} {pagination.total_rows === 1 ? 'item' : 'items'} in your wishlist
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save your favorite items for later</p>
          <Link to="/shop">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors group"
              >
                <Link to={`/product/${item.product_slug}`} className="block">
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round((item.discount / item.price) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${item.product_slug}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      ৳{(item.price - item.discount).toLocaleString()}
                    </span>
                    {item.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        ৳{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/product/${item.product_slug}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                        View Product
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.wishlistId)}
                      disabled={isRemoving === item.wishlistId}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      {isRemoving === item.wishlistId? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === pagination.total_pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={page === currentPage ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_more_pages}
                className="hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Page Info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {wishlistItems.length} of {pagination.total_rows} items
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;