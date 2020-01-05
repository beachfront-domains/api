


//  I M P O R T

import env from "vne";

//  U T I L S

import { appTagline, siteUrl } from "./variables";

const appName = env.site.name;



//  E X P O R T

export default (title: string, body: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset=utf-8"/>
        <title>${title}</title>

        <meta name="viewport" content="width=device-width"/>

        <style>
          html {
            background-color: #fcfcfc;
            box-sizing: border-box;
            text-rendering: optimizeLegibility;

            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
          }

          *,
          *::before,
          *::after {
            margin: 0; padding: 0;

            box-sizing: inherit;
            outline: 0 !important;
          }

          html,
          body,
          main {
            width: 100% !important; height: 100%;
          }

          body {
            min-width: 320px; min-height: 100vh;
            margin: 0 !important; padding: 0 !important;

            color: #111;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 14px;
            position: relative;
          }

          .inner-wrap {
            margin-right: auto !important;
            margin-left: auto !important;
            max-width: 600px;
          }

          .inner-wrap::after {
            clear: both;
            content: "";
            display: block;
          }

          header,
          footer {
            display: block;
          }

          header {
            background-color: #111;
            background-image: linear-gradient(135deg, #d9afd9 0%, #97d9e1 100%);
            color: #fcfcfc;
            font-size: 1.25rem;
            margin-bottom: 2rem;
            padding-top: 1.25rem;
            padding-bottom: 1.25rem;
            text-shadow: 0 1px 1px rgba(17, 17, 17, 0.3);
            width: 100% !important;
          }

          main {
            display: flex;
            flex-direction: column;
          }

          section {
            flex: 1;
            width: 100%;
          }

          h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .logo {
            margin-right: 0.5rem; padding-right: 1rem;

            border-right: 1px solid rgba(253, 253, 253, 0.3);
            font-weight: 600;
          }

          .reply {
            background-color: #fff;
            border: 1px solid #eee;
            color: #111;
            margin-bottom: 1rem; padding: 1rem;
          }

          ol,
          ul,
          p {
            line-height: 1.55;
          }

          ol,
          ul,
          p:not(:last-of-type) {
            margin-bottom: 1rem;
          }

          ol,
          ul {
            padding-left: 1.5rem;
          }

          a {
            color: #38a0db;
            text-decoration: underline;
          }

          sup {
            color: #ddd;
            font-size: 80%;
          }

          footer {
            margin-bottom: 2rem; padding-top: 1rem;
          }

          footer hr {
            width: 100%; height: 1px;

            background-color: #ddd;
            border: 0 !important;
            margin-bottom: 2rem;
          }

          @media (min-width: 501px) and (max-width: 1050px) {
            .inner-wrap {
              padding-right: 2rem;
              padding-left: 2rem;
            }
          }

          @media (max-width: 500px) {
            .inner-wrap {
              padding-right: 1.25rem;
              padding-left: 1.25rem;
            }
          }
        </style>
      </head>

      <body itemscope itemtype="http://schema.org/EmailMessage">
        <main>
          ${body}

          <footer>
            <hr class="inner-wrap"/>
            <p class="inner-wrap">
              <a href="https://${siteUrl}" title="${appTagline}">${appName}</a><sup>β</sup> is brought to you by <a href="https://inc.sh" title="!NC, helping to make the 'Net a better place">Ideas Never Cease</a>.
            </p>
          </footer>
        </main>
      </body>
    </html>
  `;
};
