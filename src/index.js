const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const rootElement = document.querySelector('#root');
const contentElement = document.createElement('div');
const GET_DATA_API = ( url ) => {
  ajax.open('GET', url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}
function newsFeeds() {
  const newsFeed = GET_DATA_API(NEWS_URL);
  const newsList = `<ul>
  ${newsFeed.map(item => `<li>
                            <a href="#${item.id}">
                              ${item.title} (${item.comments_count}))
                            </a>
                          </li>`).join('')}
  </ul>`
  rootElement.innerHTML = newsList;
}
function newsDetail() {
  const id = location.hash.substr(1);
  const newsContent = GET_DATA_API(CONTENT_URL.replace('@id', id));
  rootElement.innerHTML = `
  <h1>${newsContent.title}</h1>
  
  <div>
      <a href="#">목록으로</a>
  </div>`
}
window.addEventListener('hashchange', (event) => {
  newsDetail();
})

newsFeeds();
