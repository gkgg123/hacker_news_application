const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const content = document.createElement('div');
ajax.open('GET', NEWS_URL, false);
ajax.send();
window.addEventListener('hashchange', (event) => {
  const id = location.hash.substr(1);
  ajax.open('GET', CONTENT_URL.replace('@id', id), false);
  ajax.send();
  const newsContent = JSON.parse(ajax.response);
  const title = document.createElement('h1');
  title.innerHTML = newsContent.title;
  content.appendChild(title);

})
const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul')
ul.innerHTML = newsFeed.map(item => `<li><a href="#${item.id}">${item.title} (${item.comments_count}))</a></li>`).join('');
document.querySelector('#root').appendChild(ul);
document.querySelector('#root').appendChild(content);