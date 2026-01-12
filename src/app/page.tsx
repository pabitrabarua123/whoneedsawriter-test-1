import { CtaBox } from "@/components/CtaBox/CtaBox";
import { FAQ } from "@/components/FAQ/FAQ";
import { Features } from "@/components/Features/Features";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { Pricing } from "@/components/Pricing/Pricing";
//import { ExplainerVideo } from "@/components/ExplainerVideo/ExplainerVideo";
import { getSEOTags } from "@/components/SEOTags/SEOTags";
import { Testimonials } from "@/components/Testimonials/Testimonials";
import { Metadata } from "next";
import SampleArticles from "@/components/SampleArticles/SampleArticles";
import { websiteUrl } from "@/config";

export const metadata: Metadata = getSEOTags({
  title: 'AI Blog post Generator | Well Researched with Images',
  description: 'Generate hundreds of high-quality Blog Posts from just a keyword in one click. Complete with research and images in minutes. WhoNeedsaWriter makes Blogging effortless.',
});

export default function Home() {
  // Create JSON-LD schema
  const logoUrl = `${websiteUrl}/_next/image?url=%2Flogo.png&w=256&q=75`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${websiteUrl}/#organization`,
        "name": "Who needs a writer",
        "url": `${websiteUrl}/`,
        "email": "info@whoneedsawriter.com",
        "logo": {
          "@type": "ImageObject",
          "@id": `${websiteUrl}/#logo`,
          "url": logoUrl,
          "contentUrl": logoUrl
        }
      },
      {
        "@type": "WebSite",
        "@id": `${websiteUrl}/#website`,
        "url": `${websiteUrl}/`,
        "name": "Who needs a writer",
        "publisher": { "@id": `${websiteUrl}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${websiteUrl}/blog?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${websiteUrl}/#homepage`,
        "url": `${websiteUrl}/`,
        "name": "Who needs a writer — AI Blog Post Generator",
        "isPartOf": { "@id": `${websiteUrl}/#website` },
        "about": { "@id": `${websiteUrl}/#software` },
        "publisher": { "@id": `${websiteUrl}/#organization` },
        "primaryImageOfPage": { "@id": `${websiteUrl}/#logo` },
        "description": "AI blog post generator that creates well-researched, human-focused articles with images. Optimized for featured snippets — just enter a keyword and get started."
      },
      {
        "@type": ["SoftwareApplication", "Product"],
        "@id": `${websiteUrl}/#software`,
        "name": "Who needs a writer",
        "url": `${websiteUrl}/`,
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "brand": { "@id": `${websiteUrl}/#organization` },
        "description": "AI blog post generator that produces well-researched, human-focused blog posts with high-quality images and featured-snippet optimization.",
        "featureList": [
          "Well-researched articles",
          "Human-focused writing",
          "Featured snippet optimization",
          "AI-generated images",
          "SERP analysis",
          "Keyword intent analysis",
          "Semantic SEO",
          "Deep research",
          "Bulk writing mode",
          "WordPress integration",
          "Email support"
        ],
        "offers": {
          "@type": "OfferCatalog",
          "name": "Pricing Plans",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Starter",
              "url": `${websiteUrl}/pricing`,
              "priceCurrency": "USD",
              "price": "10",
              "description": "Monthly plan. 5 credits/month (~5 researched articles). Short form ≈ 0.1 credit, Researched ≈ 1 credit, Deep researched ≈ 2 credits."
            },
            {
              "@type": "Offer",
              "name": "Pro",
              "url": `${websiteUrl}/pricing`,
              "priceCurrency": "USD",
              "price": "30",
              "description": "Monthly plan. 20 credits/month (~20 researched articles). Short form ≈ 0.1 credit, Researched ≈ 1 credit, Deep researched ≈ 2 credits."
            },
            {
              "@type": "Offer",
              "name": "Premium",
              "url": `${websiteUrl}/pricing`,
              "priceCurrency": "USD",
              "price": "80",
              "description": "Monthly plan. 60 credits/month (~60 researched articles). Short form ≈ 0.1 credit, Researched ≈ 1 credit, Deep researched ≈ 2 credits."
            },
            {
              "@type": "Offer",
              "name": "Ultimate",
              "url": `${websiteUrl}/pricing`,
              "priceCurrency": "USD",
              "price": "200",
              "description": "Monthly plan. 200 credits/month (~200 researched articles). Short form ≈ 0.1 credit, Researched ≈ 1 credit, Deep researched ≈ 2 credits."
            }
          ]
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Header />
      <main className="">
        <Hero />
        {/* <ExplainerVideo /> */}
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <SampleArticles />
        <CtaBox />
      </main>
      <Footer />
    </>
  );
}
