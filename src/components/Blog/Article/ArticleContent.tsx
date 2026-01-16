import React from "react";
import { Box, Container, Flex } from "@chakra-ui/react";

interface Props {
  content: React.ReactNode;
}

const ArticleContent = ({ content }: Props) => {
  // Remove the first h1 tag from content since title is already displayed above
  const processedContent = typeof content === 'string' 
    ? content.replace(/<h1[^>]*>.*?<\/h1>/i, '').trim()
    : content;

  return (
    <Container maxW="container.md">
      <Flex flexDir="column">
        <Box
          fontSize="18px"
          lineHeight="30px"
          sx={{
            h1: {
              fontSize: "32px",
              lineHeight: "40px",
              fontWeight: 800,
              mt: "24px",
              mb: "16px",
            },
            h2: {
              fontSize: "26px",
              lineHeight: "32px",
              fontWeight: 700,
              mt: "64px",
              mb: "16px",
            },
            h3: {
              fontSize: "22px",
              lineHeight: "28px",
              fontWeight: 700,
              mt: "48px",
              mb: "16px",
            },
            h4: {
              fontSize: "20px",
              lineHeight: "26px",
              fontWeight: 700,
              mt: "32px",
              mb: "16px",
            },
            h5: {
              fontSize: "18px",
              lineHeight: "24px",
              fontWeight: 700,
              mt: "24px",
              mb: "16px",
            },
            h6: {
              fontSize: "16px",
              lineHeight: "22px",
              fontWeight: 700,
              mt: "16px",
              mb: "16px",
            },
            "ul, ol": {
              ml: "24px",
              p: "4px",
            },
            li: {
              ml: "16px",
              pl: 0,
            },
            img: {
              my: "16px",
              objectFit: "contain",
            },
            p: {
              my: "24px",
            },
            a: {
              color: "primary.400",
              _hover: {
                color: "primary.600",
              },
            },
            "pre, code": {
              fontSize: "14px",
              color: "gray.600",
              px: "4px",
              py: "2px",
              backgroundColor: "gray.100",
              borderRadius: "4px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "gray.20",
            },
            pre: {
              my: "16px",
              p: "16px",
              overflowX: "scroll",
            },
            "pre > code": {
              borderWidth: "0",
              fontSize: "14px",
            },
            blockquote: {
              p: "16px 24px",
              bgColor: "primary.10",
              borderLeftWidth: "4px",
              borderLeftStyle: "solid",
              borderLeftColor: "primary.300",
            },
            "blockquote a": {
              color: "gray.700",
              borderBottomWidth: "1px",
              borderBottomStyle: "dotted",
              borderBottomColor: "gray.600",
            },
            "blockquote a:hover": {
              color: "primary.600",
            },
            "blockquote::first-line": {
              fontWeight: "bold",
              color: "primary.800",
            },
            "blockquote > p": {
              my: "4px",
            },
            "table": {
              my: "16px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "gray.200",
              borderRadius: "4px",
              th: {
                backgroundColor: "primary.100",
                fontWeight: "bold",
                padding: "0 7px 4px 7px",
                verticalAlign: "top",
              },
              td: {
                borderWidth: "1px",
                padding: "0 10px",
                verticalAlign: "top",
              },
            },
          }}
          dangerouslySetInnerHTML={{ __html: processedContent as string }}
        >
        </Box>
      </Flex>
    </Container>
  );
};

export default ArticleContent;
