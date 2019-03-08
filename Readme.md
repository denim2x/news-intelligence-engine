# News intelligence engine

Web app for browsing entities found within news articles

## Setup

First you should have certain variables in your environment:
- `NEWSAPI_KEY`: API key for [News API](https://newsapi.org)
- `DANDELION_TOKEN`: auth token for [Dandelion API](https://dandelion.eu/)
- `GRAPHAPI_KEY`: API key for [Google Knowledge Graph Search API](https://developers.google.com/knowledge-graph/)

```sh
npm install
npm start
```

Launches a Web server at port `process.env.PORT` - open your browser to view the app in action.
