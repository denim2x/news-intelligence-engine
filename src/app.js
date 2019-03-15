'use strict';

const type = require('type-of');
const palette = require('google-palette');
const request = require('superagent');
require('linqjs');
const rivets = require('rivets');
const h = require('hyperscript-string');
const bean = require('bean');

let Article = document.querySelector('.Article');
let entity_timer, active_entity;
function mark(el) {
  if (active_entity) {
    active_entity.classList.remove('active');
  }
  active_entity = el;
  active_entity.classList.add('active');
}
const state = { 
  articles: [], 
  entity: [],
  query: null,
  article: [],
  fetchArticles(e) {
    e.preventDefault();
    let query = state.query.trim();
    if (query == '')
      return;
    request.get('/articles/' + query).type('json').then(({ body }) => {
      state.articles = body.articles;
    });
  },
  showArticle(e, { item }) {
    request.get('/entities/' + encodeURIComponent(item.url)).type('json').then(({ body }) => {
      state.article = body;
      let content = [], start = 0, line = [];
      for (let i = 0; i < body.annotations.length; i++) {
        let unit = body.annotations[i];
        let text = body.text.slice(start, unit.start);
        let spans = text.split(/\n/g).map(t => ({ text: t }));
        if (spans.length > 0) {
          if (spans[0].text != '') {
            line.push(spans[0]);
          }
        }
        if (spans.length > 1) {
          if (line.length > 0) {
            content.push(line);
          }
          content.push(...spans.slice(1, -1).filter(s => s.text != '').map(s => [s]));
          line = spans.slice(-1);
          if (line[0].text == '') {
            line = [];
          }
        }
        line.push({ text: unit.spot, entity: unit.title });
        start = unit.end;
      }
      content.push(line);
      state.article.content = content;
      Article.scrollTo(0, 0);
      state.article.visible = true;
    });
  },
  showEntity(e, data) {
    entity_timer = setTimeout(() => {
      const el = e.target;
      if (data.details != null) {
        state.entity = data.details;
        mark(e.target);
        return;
      }
      request.get('/entity/' + data.entity).type('json').then(({ body }) => {
        if (body.itemListElement == null)
          return;
        let details = body.itemListElement.map(({ result: { name, '@type': categories, description }}) => ({ name, categories, description}));
        let description = [...new Set(details.slice(0, 3).map(d => d.description))].join(', ');
        let categories = new Set(details.slice(0, 3).map(d => d.categories).flat());
        let refs = details.filter(d => d.categories.some(c => !categories.has(c))).sort(({ categories: a }, { categories: b }) => a.includes('Event') ? 1 : (b.includes('Event') ? -1 : 0));
        data.details = [{ name: data.entity, categories: [...categories], description }, ...refs];
        state.entity = data.details;
        mark(e.target);
      });
    }, 700);
  },
  cancelEntity(e, data) {
    clearTimeout(entity_timer);
  },
  scrollTop(e, data) {
    Article.scrollTo(0, 0);
  },
  closeArticle(e) {
    state.article.visible = false;
    state.entity = [];
  }
};

rivets.components['article-span'] = {
  template() {
    let { text, entity } = this.locals().data;
    if (entity != null) {
      return h('span.Entity', text);
    }
    return h('span', text);
  },

  initialize(el, { data }) {
    if (data.entity != null) {
      bean.on(el, 'mouseover', 'span.Entity', state.showEntity, data);
      bean.on(el, 'mouseout', 'span.Entity', state.cancelEntity);
      bean.on(el, 'click', 'span.Entity', state.scrollTop);
    }
  }
};

rivets.bind(document.body, state);


