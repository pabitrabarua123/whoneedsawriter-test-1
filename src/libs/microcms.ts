/**
 * MicroCMS API Client
 * 
 * Environment variables required:
 * - MICROCMS_SERVICE_DOMAIN: Your MicroCMS service domain (e.g., 'your-service')
 * - MICROCMS_API_KEY: Your MicroCMS API key
 * - MICROCMS_ENDPOINT: Content type endpoint (default: 'blog')
 */

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;
const ENDPOINT = process.env.MICROCMS_ENDPOINT || 'blog';

/**
 * Generate a URL-friendly slug from a title
 * Example: "What Is an AI Blog Post Generator? (2025 Explainer)" 
 *          -> "what-is-an-ai-blog-post-generator-2025-explainer"
 */
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace parentheses with spaces (so content inside becomes part of slug)
    .replace(/[()]/g, ' ')
    // Replace special characters (except word chars, spaces, and hyphens) with nothing
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

if (!SERVICE_DOMAIN || !API_KEY) {
  console.warn('MicroCMS configuration missing. Please set MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY environment variables.');
}

const BASE_URL = SERVICE_DOMAIN 
  ? `https://${SERVICE_DOMAIN}.microcms.io/api/v1/${ENDPOINT}`
  : '';

export interface MicroCMSBlogPost {
  id: string;
  title: string;
  description?: string;
  content?: string;
  body?: string;
  richText?: string;
  text?: string;
  slug?: string;
  publishedAt?: string;
  updatedAt?: string;
  revisedAt?: string;
  createdAt?: string;
  ogImage?: {
    url: string;
    width?: number;
    height?: number;
  };
  featuredImage?: {
    url: string;
    width?: number;
    height?: number;
  };
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };
  [key: string]: any; // Allow additional fields from MicroCMS
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

/**
 * Fetch all blog posts from MicroCMS with pagination
 */
export async function getAllBlogPosts(
  page: number = 1,
  limit: number = 10
): Promise<{
  posts: Array<{
    title: string;
    description: string;
    date: string;
    slug: string;
    ogImageUrl?: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    postsPerPage: number;
  };
}> {
  if (!BASE_URL || !API_KEY) {
    throw new Error('MicroCMS is not configured. Please set MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY.');
  }

  const offset = (page - 1) * limit;
  // Request HTML format for rich text fields and include common fields
  const url = `${BASE_URL}?limit=${limit}&offset=${offset}&orders=-publishedAt&richEditorFormat=html`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`MicroCMS API error: ${response.status} ${response.statusText}`);
    }

    const data: MicroCMSListResponse<MicroCMSBlogPost> = await response.json();

    // Transform MicroCMS data to match your existing structure
    const posts = data.contents.map((post) => {
      // Generate slug from title (since MicroCMS doesn't have a slug field)
      const slug = post.slug || generateSlugFromTitle(post.title);
      
      // Use publishedAt, updatedAt, or createdAt as date
      const date = post.publishedAt || post.updatedAt || post.createdAt || new Date().toISOString();
      
      // Format date to YYYY-MM-DD if it's a full ISO string
      const formattedDate = date.includes('T') 
        ? date.split('T')[0] 
        : date;

      // Try multiple possible image field names
      // Note: 'featured-image' uses bracket notation because of the hyphen
      const imageUrl = 
        (post as any)['featured-image']?.url || 
        post.ogImage?.url || 
        post.featuredImage?.url || 
        post.image?.url || 
        post.thumbnail?.url ||
        undefined;

      return {
        title: post.title,
        description: post.description || '',
        date: formattedDate,
        slug,
        ogImageUrl: imageUrl,
      };
    });

    const totalPages = Math.ceil(data.totalCount / limit);

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: data.totalCount,
        postsPerPage: limit,
      },
    };
  } catch (error) {
    console.error('Error fetching blog posts from MicroCMS:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug from MicroCMS
 */
export async function getBlogPostBySlug(slug: string): Promise<{
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  slug: string;
  content: string;
  ogImageUrl?: string;
}> {
  if (!BASE_URL || !API_KEY) {
    throw new Error('MicroCMS is not configured. Please set MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY.');
  }

  // Since MicroCMS doesn't have a slug field, we need to search by title
  // We'll fetch all posts and find the one that matches the slug
  // Request HTML format for rich text fields
  const url = `${BASE_URL}?limit=100&richEditorFormat=html`; // Fetch more posts to find the match
  
  try {
    // Fetch all posts and find the one with matching slug
    const response = await fetch(url, {
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`MicroCMS API error: ${response.status} ${response.statusText}`);
    }

    const data: MicroCMSListResponse<MicroCMSBlogPost> = await response.json();
    
    // Find the post where the generated slug matches
    const matchingPost = data.contents.find((post) => {
      const postSlug = post.slug || generateSlugFromTitle(post.title);
      return postSlug === slug;
    });

    if (matchingPost) {
      return transformBlogPost(matchingPost);
    }

    // If not found in first 100, try using slug as ID (fallback)
    const directUrl = `${BASE_URL}/${slug}?richEditorFormat=html`;
    const directResponse = await fetch(directUrl, {
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
      },
      cache: 'no-store',
    });

    if (directResponse.ok) {
      const post: MicroCMSBlogPost = await directResponse.json();
      return transformBlogPost(post);
    }

    throw new Error(`Blog post with slug "${slug}" not found in MicroCMS`);
  } catch (error) {
    console.error(`Error fetching blog post "${slug}" from MicroCMS:`, error);
    throw error;
  }
}

/**
 * Transform MicroCMS blog post to your application's format
 */
function transformBlogPost(post: MicroCMSBlogPost): {
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  slug: string;
  content: string;
  ogImageUrl?: string;
} {
  // Generate slug from title (consistent with getAllBlogPosts)
  const slug = post.slug || generateSlugFromTitle(post.title);
  const date = post.publishedAt || post.updatedAt || post.createdAt || new Date().toISOString();
  const formattedDate = date.includes('T') ? date.split('T')[0] : date;
  const updatedAt = post.revisedAt || post.updatedAt || post.publishedAt;

  // Get content field (your MicroCMS field ID is 'content')
  const content = post.content || '';

  // Get featured image (your MicroCMS field ID is 'featured-image' with hyphen)
  // Use bracket notation for hyphenated field names
  const imageUrl = 
    (post as any)['featured-image']?.url || 
    post.ogImage?.url || 
    post.featuredImage?.url || 
    post.image?.url || 
    post.thumbnail?.url ||
    undefined;

  // Log for debugging if content is missing
  if (!content) {
    console.warn('No content found in MicroCMS post. Available fields:', Object.keys(post));
  }

  return {
    title: post.title,
    description: post.description || '',
    date: formattedDate,
    updatedAt: updatedAt ? (updatedAt.includes('T') ? updatedAt.split('T')[0] : updatedAt) : undefined,
    slug,
    content,
    ogImageUrl: imageUrl,
  };
}
