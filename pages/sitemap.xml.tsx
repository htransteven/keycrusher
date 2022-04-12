import { GetServerSideProps } from "next";

const Sitemap = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const BASE_URL = "http://localhost:3000";

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://keycrusher.com</loc>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>https://keycrusher.com/challenges/classic</loc>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>https://keycrusher.com/challenges/daily</loc>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>https://keycrusher.com/about</loc>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>https://keycrusher.com/privacy</loc>
            <priority>1.0</priority>
        </url>
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
