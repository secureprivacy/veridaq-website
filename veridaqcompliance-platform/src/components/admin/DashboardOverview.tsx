@@ .. @@
-const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, loading, onQuickAction }) => {
}
+const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, loading, onQuickAction }) => {
}
+  const { user } = useAuth();
+
   if (loading) {
   }
@@ .. @@
         <div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">Content Management Dashboard</h1>
-          <p className="text-neutral-600">Manage your blog content with advanced SEO tools and AI-powered translations across 11 languages <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold ml-2">Demo Mode</span></p>
+          <p className="text-neutral-600">Manage your blog content with advanced SEO tools and AI-powered translations across 11 languages <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold ml-2">Authenticated: {user?.email}</span></p>
         </div>