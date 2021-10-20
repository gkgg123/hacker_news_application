const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
ajax.open('GET', NEWS_URL, false);
ajax.send();

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul')
ul.innerHTML = newsFeed.map(item => `<li>${item.title}</li>`).join('');
document.querySelector('#root').appendChild(ul);