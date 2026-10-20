// Builds the static Swagger docs site (deployed to GitHub Pages by .github/workflows/docs.yml)
// Usage: node scripts/buildDocs.js [outDir]   (default: _site)
const fs = require('fs');
const path = require('path');
const openapi = require('../src/docs/openapi');

const outDir = path.resolve(__dirname, '..', process.argv[2] || '_site');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'openapi.json'), JSON.stringify(openapi, null, 2));

fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bakery API Docs</title>
  <link rel="icon" href="https://bakery-api-qqsg.onrender.com/assets/images/favicon-32x32.png">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css">
  <style>body { margin: 0; background: #fff; }</style>
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: 'openapi.json',
      dom_id: '#swagger',
      docExpansion: 'list',
      defaultModelsExpandDepth: 0,
      persistAuthorization: true
    });
  </script>
</body>
</html>
`);

console.log(`Docs built in ${outDir}`);
