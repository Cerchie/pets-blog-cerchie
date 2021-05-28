const https = require('https');
const fs = require('fs');
const slugify = require('slugify');

const data = JSON.stringify({
  query: `{
    getPosts {
      title
      body
      published
      id
      categories {
        name
      }
    }
  }`,
});
console.log('DATA HERE', data)
const markdownFileTemplate = (post, categories) => `
---
title: ${post.title}
categories:  ${categories}
published: ${post.published}
---

${post.body}
`;

const options = {
  hostname: 'mojave.stepzen.net',
  path: '/netlify/pets-blog/__graphql',
  port: 443,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    Authorization: 'Apikey ' + process.env.STEPZEN_API_KEY,
    'User-Agent': 'Node',
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (d) => {
    data += d;
  });
  res.on('end', () => {
    const results = JSON.parse(data).data.getPosts;
    results.forEach((post) => {
      let categories = '';
      post.categories.forEach((category) => {
        categories += '\n- ' + category.name;
      });
      let content = markdownFileTemplate(post, categories);
      let filename = './content/blog/' + slugify(post.title) + '.md';
      fs.writeFileSync(filename, content);
    });
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();