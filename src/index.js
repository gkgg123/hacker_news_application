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
  <div class="bg-gray-600 min-h-screen">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/{{__prev_page__}}" class="text-gray-500">
            Previous
          </a>
          <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
            Next
          </a>
        </div>
      </div> 
    </div>
  </div>
  <div class="p-4 text-2xl text-gray-700">
    {{__news_feed__}}        
  </div>
</div>
  `;
  const newsFeed = GET_DATA_API(NEWS_URL.replace('@currentPage', store.currentPage));
  const newsTemplate = newsFeed.map(item => `
  <div class="p-6 ${item.read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
  <div class="flex">
    <div class="flex-auto">
      <a href="#/show/${item.id}">${item.title}</a>  
    </div>
    <div class="text-center text-sm">
      <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${item.comments_count}</div>
    </div>
  </div>
  <div class="flex mt-3">
    <div class="grid grid-cols-3 text-sm text-gray-500">
      <div><i class="fas fa-user mr-1"></i>${item.user}</div>
      <div><i class="fas fa-heart mr-1"></i>${item.points}</div>
      <div><i class="far fa-clock mr-1"></i>${item.time_ago}</div>
    </div>  
  </div>
</div>   `).join('')
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