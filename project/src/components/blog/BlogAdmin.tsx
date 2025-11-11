import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PostEditor from './PostEditor';
import { useAuth } from '../../hooks/useAuth';
import { useAllPosts } from '../../hooks/useBlogPosts';
import { Plus, CreditCard as Edit, Trash2, Eye, Globe, Calendar, FileText, Search, Filter, BarChart3 } from 'lucide-react';

interface BlogAdminProps {
  quickAction?: string | null;
}

const BlogAdmin: React.FC<BlogAdminProps> = ({ quickAction }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { posts, loading, error, createPost, updatePost, deletePost, refetchPosts } = useAllPosts();
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0
  });
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'published' | 'created' | 'wordCount'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Handle quick actions from dashboard
  useEffect(() => {
    console.log('BlogAdmin received quickAction:', quickAction);
    if (quickAction === 'create-post' && !showEditor) {
      console.log('Triggering create post editor');
      setEditingPost(null);
      setShowEditor(true);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 bg-primary-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-sm';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <div>
          <div class="font-semibold">📝 Post Editor Opened</div>
          <div class="text-sm text-primary-100">Start writing your content with SEO optimization!</div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
    } else if (quickAction === 'filter-drafts' && filterStatus !== 'draft') {
      console.log('Filtering to drafts');
      setFilterStatus('draft');
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 bg-warning-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-sm';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17a1 1 0 01-.293.707L12 19.414a1 1 0 01-.707.293H9a1 1 0 01-1-1v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z" />
        </svg>
        <div>
          <div class="font-semibold">📋 Draft Posts Filter</div>
          <div class="text-sm text-warning-100">Showing ${stats.drafts} draft posts ready for review</div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
    }
  }, [quickAction, showEditor, filterStatus, stats.drafts]);

  useEffect(() => {
    calculateStats();
  }, [posts]);

  const calculateStats = () => {
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const archived = posts.filter(p => p.status === 'archived').length;
    
    setStats({
      total: posts.length,
      published,
      drafts,
      archived
    });
  };

  const filteredPosts = posts.filter(post => {
    if (filterStatus !== 'all' && post.status !== filterStatus) return false;
    
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        const statusOrder = { published: 3, draft: 2, archived: 1 };
        aValue = statusOrder[a.status as keyof typeof statusOrder];
        bValue = statusOrder[b.status as keyof typeof statusOrder];
        break;
      case 'published':
        aValue = a.published_at ? new Date(a.published_at).getTime() : 0;
        bValue = b.published_at ? new Date(b.published_at).getTime() : 0;
        break;
      case 'created':
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
        break;
      case 'wordCount':
        aValue = getWordCount(a.content);
        bValue = getWordCount(b.content);
        break;
      default:
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const { error } = await deletePost(postId);
      if (error) {
        alert(`Error deleting post: ${error}`);
      } else {
        alert('Post deleted successfully!');
        // Force a page refresh to update the data
        window.location.reload();
        calculateStats();
      }
    }
  };

  const handleSavePost = async (postData: any) => {
    try {
      if (editingPost) {
        const { error } = await updatePost(editingPost.id, postData);
        if (error) {
          throw new Error(error);
        }
      } else {
        const { error } = await createPost({
          ...postData,
          author_id: user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          original_language: 'en'
        });
        if (error) {
          throw new Error(error);
        }
      }
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-semibold">📝 Post ${editingPost ? 'updated' : 'created'} successfully!</span>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
      setShowEditor(false);
      setEditingPost(null);
      calculateStats();
    } catch (err) {
      // Throw the error so PostEditor can handle it
      throw err;
    }
  };

  const getWordCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  if (showEditor) {
    return (
      <PostEditor 
        post={editingPost} 
        onSave={handleSavePost}
        onCancel={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="text-error-600 mb-4">Failed to load blog posts</div>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button onClick={refetchPosts} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-white via-neutral-50/30 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-10">
        <div>
          <h1 className="heading-md text-gradient mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            Blog Management
          </h1>
          <p className="body-lg text-neutral-600 max-w-2xl">Create, edit, and manage your blog content with advanced SEO tools</p>
        </div>
        
        <button
          onClick={() => {
            setEditingPost(null);
            setShowEditor(true);
          }}
          className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Create New Post
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Posts" 
          value={stats.total} 
          icon={<FileText className="w-5 h-5 text-white" />}
          color="primary"
        />
        <StatCard 
          title="Published" 
          value={stats.published} 
          icon={<Globe className="w-5 h-5 text-white" />}
          color="success"
        />
        <StatCard 
          title="Drafts" 
          value={stats.drafts} 
          icon={<Edit className="w-5 h-5 text-white" />}
          color="warning"
        />
        <StatCard 
          title="Archived" 
          value={stats.archived} 
          icon={<FileText className="w-5 h-5 text-white" />}
          color="neutral"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-lg flex items-center justify-center">
              <Filter className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-neutral-700">Filter:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
          >
            <option value="all">All Posts ({stats.total})</option>
            <option value="published">Published ({stats.published})</option>
            <option value="draft">Drafts ({stats.drafts})</option>
            <option value="archived">Archived ({stats.archived})</option>
          </select>
          
          <div className="flex items-center gap-2 ml-4">
            <div className="w-6 h-6 bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-neutral-700">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
          >
            <option value="created">Date Created</option>
            <option value="published">Date Published</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="wordCount">Word Count</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts by title, content, or excerpt..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Posts Table */}
      {filteredPosts.length === 0 && !loading ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FileText className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {searchTerm ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {searchTerm ? 
              `No posts match "${searchTerm}". Try a different search term.` :
              'Start by creating your first blog post to share insights with your audience.'
            }
          </p>
          <button
            onClick={() => {
              // Force a page refresh to update the data
              window.location.reload();
              setEditingPost(null);
              setShowEditor(true);
            }}
            className="btn-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                    <button 
                      onClick={() => {
                        if (sortBy === 'title') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('title');
                          setSortOrder('asc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-primary-600 transition-colors hover:bg-primary-50 px-2 py-1 rounded-lg -mx-2"
                    >
                      Title
                      {sortBy === 'title' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                    <button 
                      onClick={() => {
                        if (sortBy === 'status') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('status');
                          setSortOrder('desc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-primary-600 transition-colors hover:bg-primary-50 px-2 py-1 rounded-lg -mx-2"
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                    <button 
                      onClick={() => {
                        if (sortBy === 'published') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('published');
                          setSortOrder('desc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-primary-600 transition-colors hover:bg-primary-50 px-2 py-1 rounded-lg -mx-2"
                    >
                      Published
                      {sortBy === 'published' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Performance</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPosts.map((post) => (
                  <PostRow 
                    key={post.id} 
                    post={post} 
                    onEdit={(post) => {
                      setEditingPost(post);
                      setShowEditor(true);
                    }}
                    onDelete={handleDeletePost}
                    onToggleStatus={async (postId: string, newStatus: string) => {
                      const { error } = await updatePost(postId, { status: newStatus as any });
                      if (error) {
                        alert(`Error updating post: ${error}`);
                      } else {
                        await refetchPosts();
                        calculateStats();
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorStyles = {
    primary: 'from-primary-50 to-primary-100 border-primary-200/60',
    success: 'from-success-50 to-success-100 border-success-200/60',
    warning: 'from-warning-50 to-warning-100 border-warning-200/60',
    neutral: 'from-neutral-50 to-neutral-100 border-neutral-200/60'
  };

  const iconColors = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    neutral: 'from-neutral-500 to-neutral-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorStyles[color]} p-6 rounded-2xl border hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconColors[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-neutral-900 mb-1 group-hover:scale-105 transition-transform duration-300">{value}</div>
      <div className="text-sm font-semibold text-neutral-700">{title}</div>
    </div>
  );
};

interface PostRowProps {
  post: any;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  onToggleStatus: (postId: string, newStatus: string) => void;
}

const PostRow: React.FC<PostRowProps> = ({ post, onEdit, onDelete, onToggleStatus }) => {
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 border-warning-300/50 shadow-sm',
      published: 'bg-gradient-to-r from-success-100 to-success-200 text-success-800 border-success-300/50 shadow-sm',
      archived: 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border-neutral-300/50 shadow-sm'
    };

    const icons = {
      draft: '📝',
      published: '🌍',
      archived: '📦'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        <span>{icons[status as keyof typeof icons]}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const togglePostStatus = async () => {
    if (updating) return;
    
    setUpdating(true);
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await onToggleStatus(post.id, newStatus);
    setUpdating(false);
  };

  const getWordCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <tr className="hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-white transition-all duration-200 group">
      <td className="px-6 py-4">
        <div className="max-w-xs">
          <div className="font-semibold text-neutral-900 line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">{post.title}</div>
          <div className="text-xs text-neutral-500 font-mono">/{post.slug}</div>
          <div className="text-xs text-neutral-500 mt-1">
            📝 {getWordCount(post.content)} words • 📖 {Math.ceil(getWordCount(post.content) / 200)} min read
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          {getStatusBadge(post.status)}
          <button
            onClick={togglePostStatus}
            disabled={updating}
            className={`block text-xs px-2 py-1 rounded-lg font-medium transition-all duration-200 ${
              updating 
                ? 'text-neutral-400 cursor-not-allowed' 
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 hover:shadow-sm'
            }`}
          >
            {updating ? 'Updating...' : 
             post.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        <div className="flex items-center gap-2 group-hover:text-primary-600 transition-colors">
          <Calendar className="w-4 h-4 text-neutral-400" />
          {formatDate(post.published_at)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-600 font-medium">SEO optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-600 font-medium">AI ready</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => window.open(`#blog/${post.slug}`, '_blank')}
            className="p-2 text-neutral-400 hover:text-primary-600 transition-all duration-200 rounded-lg hover:bg-primary-50 hover:shadow-sm hover:scale-110"
            title="Preview post"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(post)}
            className="p-2 text-neutral-400 hover:text-accent-600 transition-all duration-200 rounded-lg hover:bg-accent-50 hover:shadow-sm hover:scale-110"
            title="Edit post"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 text-neutral-400 hover:text-error-600 transition-all duration-200 rounded-lg hover:bg-error-50 hover:shadow-sm hover:scale-110"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BlogAdmin;