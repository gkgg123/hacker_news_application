const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/@currentPage.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const rootElement = document.querySelector('#root');
const contentElement = document.createElement('div');

const store = {
  currentPage: 1
};

const GET_DATA_API = ( url ) => {
  ajax.open('GET', url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}
function newsFeeds() {
  const newsFeed = GET_DATA_API(NEWS_URL.replace('@currentPage', store.currentPage));
  const newsList = `<ul>
  ${newsFeed.map(item => `<li>
                            <a href="#/show/${item.id}">
                              ${item.title} (${item.comments_count}))
                            </a>
                          </li>`).join('')}
  </ul>
  <div>
    <a href="#/page/${store.currentPage >1? store.currentPage-1:1}">이전 페이지</a>
    <a href="#/page/${store.currentPage+1}">다음 페이지</a>
  </div>
  `
  rootElement.innerHTML = newsList;
}
function newsDetail() {
  const id = location.hash.substr(7);
  const newsContent = GET_DATA_API(CONTENT_URL.replace('@id', id));
  rootElement.innerHTML = `
  <h1>${newsContent.title}</h1>
  
  <div>
      <a href="#/page/${store.currentPage}">목록으로</a>
  </div>`
}
function router() {
  const routerPath = location.hash
  if (routerPath === '') {
    newsFeeds();
  } else if (routerPath.indexOf('#/show/') >= 0){
    newsDetail();
  } else {
    store.currentPage = Number(routerPath.substr(7));
    newsFeeds();
  }

}
window.addEventListener('hashchange',router)

router();