"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, User, MessageCircle, Tag } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    fetchTags();
  }, [pagination.page, selectedCategory, selectedTag, searchQuery]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedTag) params.append("tag", selectedTag);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`${API_URL}/api/blog?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data.blogs);
        setPagination(prev => ({ ...prev, ...data.data.pagination }));
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog/tags`);
      const data = await response.json();
      if (data.success) {
        setTags(data.data.slice(0, 10)); // Show top 10 tags
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TripGo Travel Blog</h1>
          <p className="text-xl text-white/90 mb-8">
            Explore travel tips, destination guides, and insider insights
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag size={20} />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      !selectedCategory ? "bg-primary text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === category ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              {tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag === selectedTag ? "" : tag);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          selectedTag === tag
                            ? "bg-primary text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {tag} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No blog posts found.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedTag("");
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <Link key={blog.id} href={`/blog/${blog.slug}`}>
                      <div className="bg-white rounded-lg shadow hover:shadow-lg transition h-full flex flex-col">
                        {blog.featuredImage && (
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          {blog.category && (
                            <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                              {blog.category}
                            </span>
                          )}
                          <h2 className="text-xl font-bold mb-2 hover:text-primary transition line-clamp-2">
                            {blog.title}
                          </h2>
                          {blog.excerpt && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>
                                {blog.author.firstName} {blog.author.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{formatDate(blog.publishedAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle size={14} />
                                <span>{blog._count.comments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-lg bg-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                          className={`w-10 h-10 rounded-lg ${
                            pagination.page === i + 1
                              ? "bg-primary text-white"
                              : "bg-white shadow hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded-lg bg-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
