import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';

interface BlogSearchProps {
  posts: any[];
  onFilteredPosts: (posts: any[]) => void;
  className?: string;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ 
  posts, 
  onFilteredPosts, 
  className = '' 
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Filter posts based on search term
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts;
    }

    const term = searchTerm.toLowerCase();
    return posts.filter(post => {
      return (
        post.title?.toLowerCase().includes(term) ||
        post.content?.toLowerCase().includes(term) ||
        post.excerpt?.toLowerCase().includes(term) ||
        post.meta_keywords?.toLowerCase().includes(term)
      );
    });
  }, [posts, searchTerm]);

  // Update parent component with filtered results
  React.useEffect(() => {
    onFilteredPosts(filteredPosts);
  }, [filteredPosts, onFilteredPosts]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsActive(value.length > 0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsActive(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors duration-300 ${
            isActive ? 'text-primary-600' : 'text-neutral-400'
          }`} />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('blog:searchPlaceholder') || 'Search blog posts...'}
          className={`w-full pl-14 pr-14 py-4 bg-white/95 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 font-medium text-neutral-900 placeholder:text-neutral-400 shadow-md ${
            isActive
              ? 'border-primary-400 ring-4 ring-primary-100 shadow-premium'
              : 'border-neutral-200 hover:border-primary-200 hover:shadow-lg'
          } focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100`}
          aria-label="Search blog posts"
        />

        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-neutral-400 hover:text-primary-600 transition-colors duration-300"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {searchTerm && (
        <div className="mt-4 text-sm font-medium text-center">
          {filteredPosts.length === 0 ? (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="text-neutral-600">
                No posts found for <span className="font-bold text-neutral-900">"{searchTerm}"</span>
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl">
              <span className="text-primary-700">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogSearch;