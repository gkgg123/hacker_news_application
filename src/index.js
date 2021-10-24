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
  let template = `
  <div class="container mx-auto p-4">
    <h1>Hacker News</h1>
    <ul>
      {{__news_feed__}}
    </ul>
    <div>
      <a href="#/page/{{__prev_page__}}">이전 페이지</a>
      <a href="#/page/{{__next_page__}}">다음 페이지</a>
    </div>
  </div>`;
  const newsFeed = GET_DATA_API(NEWS_URL.replace('@currentPage', store.currentPage));
  const newsTemplate = newsFeed.map(item => `<li>
                            <a href="#/show/${item.id}">
                              ${item.title} (${item.comments_count}))
                            </a>
                          </li>`).join('')
  template = template.replace('{{__news_feed__}}', newsTemplate);
  template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1)
  template = template.replace('{{__next_page__}}',store.currentPage+1)
  rootElement.innerHTML = template;
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
    console.log(store.currentPage);
    newsFeeds();
  }

}
window.addEventListener('hashchange',router)

router();