import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { useTranslation } from 'react-i18next';

interface BlogListProps {
  limit?: number;
  showTitle?: boolean;
  language?: string;
}

const BlogList: React.FC<BlogListProps> = ({ 
  limit, 
  showTitle = true,
  language
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = language || i18n.language;
  const { posts, translations, loading, error } = useBlogPosts({
    language: currentLanguage,
    status: 'published',
    limit
  });
  
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);

  // Use either English posts or translations based on language
  // Wrapped in useMemo to stabilize reference and prevent unnecessary recalculations
  const allPosts = React.useMemo(() => {
    const result = currentLanguage === 'en' ? posts : translations;
    console.log('BlogList: allPosts computed', {
      currentLanguage,
      postsLength: posts.length,
      translationsLength: translations.length,
      resultLength: result.length
    });
    return result;
  }, [currentLanguage, posts, translations]);

  // Update filteredPosts whenever allPosts changes and we're not loading
  React.useEffect(() => {
    console.log('BlogList: useEffect triggered', {
      currentLanguage,
      postsLength: posts.length,
      translationsLength: translations.length,
      allPostsLength: allPosts.length,
      loading,
      error
    });

    // Only update when not loading to avoid race conditions
    if (!loading) {
      console.log('BlogList: Setting filteredPosts to', allPosts.length, 'posts');
      console.log('BlogList: Post titles:', allPosts.map(p => p.title).slice(0, 3));
      setFilteredPosts(allPosts);
    }
  }, [allPosts, loading, posts, translations, currentLanguage]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <BlogPostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error-600 mb-4">Failed to load blog posts</div>
        <p className="text-neutral-600">{error}</p>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          📝
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">{t('blog:noPostsYet')}</h3>
        <p className="text-neutral-600 mb-8">
          {t('blog:noPostsDesc')}
        </p>
      </div>
    );
  }

  return (
    <section className="py-8">
      {showTitle && (
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('blog:latestInsights')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('blog:latestInsightsDesc')}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} language={currentLanguage} />
        ))}
      </div>

      {!limit && filteredPosts.length >= 6 && (
        <div className="text-center mt-10">
          <p className="text-neutral-600">
            Showing {filteredPosts.length} of {allPosts.length} posts
          </p>
        </div>
      )}
    </section>
  );
};

interface BlogPostCardProps {
  post: any;
  language: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, language }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWordCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter((word: string) => word.length > 0).length;
  };

  const publishedDate = language === 'en' ? post.published_at : post.posts?.published_at || post.published_at;
  const wordCount = getWordCount(post.content);
  const postUrl = React.useMemo(
    () => (language === 'en' ? `/blog/${post.slug}/` : `/${language}/blog/${post.slug}/`),
    [language, post.slug]
  );

  return (
    <article className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:border-primary-200 shadow-modern hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2">
      {post.featured_image_url && (
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          <img
            src={post.featured_image_url}
            alt={post.title}
            srcSet={`
              ${post.featured_image_url}?w=400 400w,
              ${post.featured_image_url}?w=600 600w,
              ${post.featured_image_url}?w=800 800w
            `}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            width="800"
            height="450"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Category badge on image */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md text-xs font-semibold text-primary-700 border border-primary-200">
              EU Compliance
            </span>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <time dateTime={publishedDate} className="font-medium">{formatDate(publishedDate)}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="font-medium">{Math.ceil(wordCount / 200)} {t('blog:minRead')}</span>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold font-display text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-neutral-600 mb-6 line-clamp-3 leading-relaxed text-base">
            {post.excerpt}
          </p>
        )}

        {!post.excerpt && post.content && (
          <p className="text-neutral-600 mb-6 line-clamp-3 leading-relaxed text-base">
            {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        )}

        <a
          href={postUrl}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
        >
          {t('blog:readMore')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </article>
  );
};

const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="modern-card rounded-3xl overflow-hidden">
      <div className="aspect-video bg-neutral-200 animate-pulse"></div>
      <div className="p-8 space-y-4">
        <div className="flex gap-4">
          <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="h-6 bg-neutral-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
        </div>
        <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  );
};

export default BlogList;