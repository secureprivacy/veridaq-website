import React from 'react';
import { Link } from '../ui/Link';
import { Calendar, ArrowLeft, Clock, Share2, ArrowRight } from 'lucide-react';
import { useBlogPost } from '../../hooks/useBlogPosts';
import { useTranslation } from 'react-i18next';
import SEO from '../SEO';
import { SUPPORTED_LANGUAGES } from '../../utils/languageUtils';
import { Breadcrumb, generateBreadcrumbSchema } from './Breadcrumb';
import { getRelatedPosts } from '../../utils/relatedPosts';

interface BlogPostProps {
  slug: string;
  language: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ slug, language }) => {
  const { t } = useTranslation();
  const [relatedPosts, setRelatedPosts] = React.useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = React.useState(true);

  const { post, loading, error } = useBlogPost(slug, language);

  React.useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (post && slug) {
        setLoadingRelated(true);
        const related = await getRelatedPosts(slug, language, 3);
        setRelatedPosts(related);
        setLoadingRelated(false);
      }
    };
    fetchRelatedPosts();
  }, [post, slug, language]);

  const getWordCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) {
    return <BlogPostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900 mb-4">{t('blog:postNotFound')}</div>
          <p className="text-neutral-600 mb-8">
            {error || t('blog:postNotFoundDesc')}
          </p>
          <Link href="#blog" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog:backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const publishedDate = language === 'en' ? post.published_at : (post as any).posts?.published_at || post.published_at;
  const wordCount = getWordCount(post.content);
  const readingTime = Math.ceil(wordCount / 200);

  const breadcrumbItems = [
    { label: 'Home', href: language === 'en' ? '/' : `/${language}` },
    { label: 'Blog', href: language === 'en' ? '/blog' : `/${language}/blog` },
    { label: post.title }
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {/* Dynamic SEO based on post content */}
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords}
        image={post.featured_image_url}
        canonical={`https://veridaq.com${language === 'en' ? '' : `/${language}`}/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: publishedDate,
          modifiedTime: language === 'en' ? post.updated_at : (post as any).updated_at,
          author: 'Veridaq Team',
          section: 'EU Compliance',
          tags: post.meta_keywords?.split(',').map(k => k.trim()).slice(0, 5) || []
        }}
        structuredData={[breadcrumbSchema]}
      />

      {/* Hero Section with Featured Image */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-white via-slate-50/30 to-white overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-primary-300/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Back Navigation */}
            <div className="mb-8">
              <Link
                href={language === 'en' ? '/blog' : `/${language}/blog`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-md text-neutral-700 hover:text-primary-600 hover:border-primary-200 transition-all duration-300 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('blog:backToBlog')}
              </Link>
            </div>

            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl border border-primary-200 shadow-sm text-sm font-semibold text-primary-700">
                EU Compliance
              </span>
            </div>

            {/* Post Title */}
            <h1 className="text-4xl md:text-6xl font-bold font-display text-accent-900 mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Post Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-neutral-600 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
                  V
                </div>
                <span className="font-medium">Veridaq Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <span className="font-medium">{formatDate(publishedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <span className="font-medium">{readingTime} {t('blog:minRead')}</span>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="text-xl md:text-2xl text-neutral-600 leading-relaxed mb-12 p-6 bg-white/60 backdrop-blur-sm border-l-4 border-primary-500 rounded-r-2xl shadow-sm">
                {post.excerpt}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image_url && (
        <section className="relative -mt-8 mb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-premium-lg border border-neutral-200">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  srcSet={`
                    ${post.featured_image_url}?w=400 400w,
                    ${post.featured_image_url}?w=800 800w,
                    ${post.featured_image_url}?w=1200 1200w,
                    ${post.featured_image_url}?w=1600 1600w
                  `}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                  width="1200"
                  height="675"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-4 md:px-6 pb-16 max-w-4xl">

        {/* Post Content */}
        <div 
          className="prose-enhanced mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Section */}
        <div className="border-t border-neutral-200 pt-12 mt-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-gradient-to-r from-neutral-50 to-white rounded-2xl border border-neutral-200">
            <div>
              <h3 className="font-bold font-display text-xl text-neutral-900 mb-2">{t('blog:shareArticle')}</h3>
              <p className="text-neutral-600">{t('blog:shareHelp')}</p>
            </div>

            <div className="flex gap-3">
              <ShareButton
                platform="linkedin"
                url={window.location.href}
                title={post.title}
              />
              <ShareButton
                platform="twitter"
                url={window.location.href}
                title={post.title}
              />
              <ShareButton
                platform="email"
                url={window.location.href}
                title={post.title}
              />
            </div>
          </div>
        </div>

        {/* Related Content Suggestions */}
        <div className="mt-16 p-8 md:p-12 bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl border border-primary-200 shadow-modern">
          <h3 className="text-2xl font-bold font-display text-neutral-900 mb-6">
            {t('blog:relatedArticles', 'Related Articles')}
          </h3>
          {loadingRelated ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-neutral-200 animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : relatedPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  href={`${language === 'en' ? '' : `/${language}`}/blog/${relatedPost.slug}`}
                  className="group p-6 bg-white rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-base font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </span>
                  {relatedPost.excerpt && (
                    <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{relatedPost.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">{t('blog:noRelatedArticles', 'No related articles found')}</p>
          )}
        </div>

        {/* Expert CTA Section */}
        <div className="mt-16 p-12 bg-gradient-to-br from-accent-900 to-accent-800 rounded-3xl text-center shadow-premium-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold font-display text-white mb-4">
            {t('blog:implementStrategies')}
          </h3>
          <p className="text-neutral-200 mb-8 max-w-2xl mx-auto text-lg">
            {t('blog:implementDescription')}
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold font-display rounded-xl hover:bg-neutral-50 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {t('blog:getConsultation')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </article>
    </>
  );
};

interface ShareButtonProps {
  platform: 'linkedin' | 'twitter' | 'email';
  url: string;
  title: string;
  language?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ platform, url, title }) => {
  const handleShare = () => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(`${title} - Expert insights from Veridaq`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=I thought you might find this EU compliance article interesting:%0D%0A%0D%0A${encodedUrl}%0D%0A%0D%0AThis article covers important compliance strategies for EU AMLR 2027 requirements.`;
        break;
    }
    
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'email':
        return <Share2 className="w-5 h-5" />;
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-14 h-14 rounded-2xl bg-white border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 text-neutral-600 hover:text-primary-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
      title={`Share on ${platform}`}
      aria-label={`Share on ${platform}`}
    >
      {getIcon()}
    </button>
  );
};

const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-white">
      {/* Hero Skeleton */}
      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8 animate-pulse">
              {/* Back button skeleton */}
              <div className="h-10 bg-neutral-200 rounded-xl w-32"></div>

              {/* Badge skeleton */}
              <div className="h-8 bg-neutral-200 rounded-xl w-40"></div>

              {/* Title skeleton */}
              <div className="space-y-3">
                <div className="h-12 bg-neutral-200 rounded-lg w-full"></div>
                <div className="h-12 bg-neutral-200 rounded-lg w-4/5"></div>
              </div>

              {/* Metadata skeleton */}
              <div className="flex gap-6">
                <div className="h-8 bg-neutral-200 rounded-lg w-32"></div>
                <div className="h-8 bg-neutral-200 rounded-lg w-32"></div>
                <div className="h-8 bg-neutral-200 rounded-lg w-32"></div>
              </div>

              {/* Excerpt skeleton */}
              <div className="space-y-2 p-6 bg-white/60 rounded-r-2xl border-l-4 border-neutral-200">
                <div className="h-6 bg-neutral-200 rounded w-full"></div>
                <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image Skeleton */}
      <section className="relative -mt-8 mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-neutral-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <article className="container mx-auto px-4 md:px-6 pb-16 max-w-4xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-8"></div>
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;