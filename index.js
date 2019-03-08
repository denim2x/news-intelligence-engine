'use strict';

const express = require('express');
const request = require('superagent');
const path = require('path');

let news_api = request
  .get('https://newsapi.org/v2/everything')
  .type('json')
  .set('X-Api-Key', process.env.NEWSAPI_KEY);

let dandelion_api = request
  .get('https://api.dandelion.eu/datatxt/nex/v1')
  .type('json')
  .query({ 
    token: process.env.DANDELION_TOKEN, 
    min_confidence: '0.21'
  });
  
let graph_api = request
  .get('https://kgsearch.googleapis.com/v1/entities:search')
  .type('json')
  .query({ key: process.env.GRAPHAPI_KEY });
  
function pipe(agent, res) {
  let clone = request(agent.method, agent.url);
  clone.set(agent.header);
  clone.query(agent.qs);
  return clone.pipe(res);
}
  
const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/articles/:query', (req, res) => {
  const { query } = req.params;
  res.type('application/json');
  pipe(news_api.query({ q: query }), res);
});

app.get('/entities/:url', (req, res) => {
  const { url } = req.params;
  res.type('application/json');
  pipe(dandelion_api.query({ url: decodeURIComponent(url) }), res);
});

app.get('/entity/:name', (req, res) => {
  const { name } = req.params;
  res.type('application/json');
  pipe(graph_api.query({ query: name }), res);
});

app.listen(process.env.PORT);

