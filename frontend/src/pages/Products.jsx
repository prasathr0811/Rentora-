import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { GridSkeleton } from '../components/SkeletonLoader';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Grid, List } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || '');
  const [priceType, setPriceType] = useState('buy'); // buy or rent
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sync state from query params on mount/change
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSubCategory(searchParams.get('subCategory') || '');
  }, [searchParams]);

  // Fetch categories list
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await API.get('/products/categories');
        setCategoriesData(data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          pageSize: 12,
          keyword,
          category: selectedCategory,
          subCategory: selectedSubCategory,
          sortBy,
          priceType,
        };

        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await API.get('/products', { params });
        setProducts(data.products || []);
        setPage(data.page || 1);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.totalProducts || 0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedCategory, selectedSubCategory, priceType, minPrice, maxPrice, sortBy, page]);

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPriceType('buy');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setSelectedSubCategory(''); // reset subcategory on category switch
    setPage(1);
    
    // Update search query param
    const newParams = {};
    if (keyword) newParams.keyword = keyword;
    if (catName) newParams.category = catName;
    setSearchParams(newParams);
  };

  const handleSubCategorySelect = (subName) => {
    setSelectedSubCategory(subName);
    setPage(1);
    
    const newParams = {};
    if (keyword) newParams.keyword = keyword;
    if (selectedCategory) newParams.category = selectedCategory;
    if (subName) newParams.subCategory = subName;
    setSearchParams(newParams);
  };

  const getSubcategoriesForCategory = () => {
    const matched = categoriesData.find((c) => c._id === selectedCategory);
    return matched ? matched.subCategories : [];
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Column: Filters Sidebar */}
        <aside className="w-full lg:w-52 flex-shrink-0 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm h-fit space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <SlidersHorizontal size={18} className="mr-2 text-slate-500" /> Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Search Query Filter */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type keywords..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Categories Facets */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</label>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !selectedCategory
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categoriesData.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat._id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat._id}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories (Only visible if Category selected) */}
          {selectedCategory && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcategories</label>
              <div className="space-y-1 pl-2 border-l border-slate-100">
                <button
                  onClick={() => handleSubCategorySelect('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !selectedSubCategory
                      ? 'bg-primary-50/70 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All {selectedCategory}
                </button>
                {getSubcategoriesForCategory().map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubCategorySelect(sub)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedSubCategory === sub
                        ? 'bg-primary-50/70 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Limits</label>
            
            {/* Price Type toggle */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPriceType('buy')}
                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  priceType === 'buy' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Buying
              </button>
              <button
                type="button"
                onClick={() => setPriceType('rent')}
                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  priceType === 'rent' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Renting
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min INR"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max INR"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

        </aside>

        {/* Right Column: Listing and Sorting Header */}
        <section className="flex-1 min-w-0 space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Audited Listing</p>
              <h2 className="text-xl font-extrabold text-slate-800 mt-0.5">
                {loading ? 'Searching...' : `${totalProducts} Products Available`}
              </h2>
            </div>
            
            {/* Sorting */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer w-full sm:w-auto"
              >
                <option value="newest">Newest Additions</option>
                <option value="mostPopular">Highest Rated</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Tags Summary */}
          {(selectedCategory || selectedSubCategory || keyword || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Active filters:</span>
              
              {keyword && (
                <span className="inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700">
                  Search: "{keyword}"
                  <button onClick={() => { setKeyword(''); setPage(1); }} className="ml-1.5 text-slate-400 hover:text-slate-600"><X size={12} /></button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700">
                  Category: {selectedCategory}
                  <button onClick={() => handleCategorySelect('')} className="ml-1.5 text-slate-400 hover:text-slate-600"><X size={12} /></button>
                </span>
              )}

              {selectedSubCategory && (
                <span className="inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700">
                  Subcat: {selectedSubCategory}
                  <button onClick={() => handleSubCategorySelect('')} className="ml-1.5 text-slate-400 hover:text-slate-600"><X size={12} /></button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700 capitalize">
                  {priceType} Price: {minPrice || '0'} - {maxPrice || 'Max'} INR
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }} className="ml-1.5 text-slate-400 hover:text-slate-600"><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Main Products Grid */}
          {loading ? (
          <GridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
              <p className="text-4xl">🔍</p>
              <h3 className="text-xl font-bold text-slate-800 mt-4">No Products Match Your Criteria</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Try modifying search tags, clearing pricing ranges or selecting a different category sidebar option.</p>
              <button
                onClick={handleClearFilters}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl mt-6 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:opacity-50 text-slate-600 rounded-xl transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {Array(totalPages)
                .fill(0)
                .map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                      page === i + 1
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:opacity-50 text-slate-600 rounded-xl transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default Products;
