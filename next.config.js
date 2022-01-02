const { createSecureHeaders } = require("next-secure-headers");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  target: "serverless",
  async headers() {
    return [{
      source: "/(.*)",
      headers: createSecureHeaders({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: "'self'",
            styleSrc: ["'self'"],
          },
        },
        forceHTTPSRedirect: [true, { maxAge: 60 * 60 * 24 * 4, includeSubDomains: true }],
        referrerPolicy: "same-origin",
      }),
    }];
  }
}
