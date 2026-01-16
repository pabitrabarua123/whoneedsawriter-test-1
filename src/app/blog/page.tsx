import { Footer } from "@/components/Footer/Footer";
import { Box, Container } from "@chakra-ui/react";
import ArticlePreview from "@/components/Blog/ArticlePreview/ArticlePreview";
import { Header } from "@/components/Header/Header";
import { ArticleType } from "./blog.types";
import { Pagination } from "@/components/Blog/Pagination/Pagination";
import { getAllBlogPosts } from "@/libs/microcms";

async function Blog({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  
  // Fetch blog posts from MicroCMS
  const { posts: articles, pagination } = await getAllBlogPosts(page, 10);

  // Transform blog posts to match ArticleType interface
  const transformedArticles: ArticleType[] = articles.map(article => ({
    ...article,
    coverImage: article.ogImageUrl || '/default-cover.jpg',
    timeReading: { text: '5 min read' }, // You might want to calculate this based on content length
    excerpt: article.description,
    ogImage: {
      url: article.ogImageUrl || '/default-og-image.jpg'
    },
    author: {
      name: 'Admin',
      picture: '/default-author.jpg'
    },
    content: '',
    tags: []
  }));

  return (
    <Box overflow="hidden" minH="100vh">
      <Header />
      <Container maxW="container.lg" pb="64px">
        <Box my="64px">
          {transformedArticles.map((article: ArticleType) => (
            <ArticlePreview 
              key={article.slug} 
              article={article}
            />
          ))}
          
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
          />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

export default Blog;
