import React from "react";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";
import rehypeShiki from "../shiki";

const Tutorial = ({ mdxSource }) => {
  if (!mdxSource) {
    return null;
  }
  let content = hydrate(mdxSource, {});
  return <div>{content}</div>;
};

export async function getStaticProps({}) {
  const mdxContent = `
## Hello

\`\`\`jsx
var abc = ${Date.now()};
\`\`\`
`;

  const mdxSource = await renderToString(
    mdxContent,
    {},
    {
      rehypePlugins: [rehypeShiki],
    }
  );

  return {
    revalidate: 20,
    props: { mdxSource },
  };
}

export async function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          slug: "test",
        },
      },
    ],
    fallback: true,
  };
}

export default Tutorial;
