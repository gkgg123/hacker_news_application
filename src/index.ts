type Store = {
  currentPage: number;
  feeds: Map<number,NewsFeed[]>
}
type NewsFeed = {
  id: Number;
  comments_count: number;
  url: string;
  user: string;
  time_ago: string;
  points: number;
  title: string;
  read?: boolean;
}

const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/@currentPage.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
// Element의 subset이 HTMLElement이다.
const rootElement : HTMLElement|null = document.querySelector('#root');
const contentElement = document.createElement('div');
const store : Store = {
  currentPage: 1,
  feeds : new Map()
};
const GET_DATA_API = ( url ) => {
  ajax.open('GET', url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}

const make_read_feeds = (feeds) => {
  return feeds.map((feed) => {
    feed.read = false;
    return feed
  } )
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
  let newsFeed :NewsFeed[] = [];
  if (store.feeds.has(store.currentPage)) {
    newsFeed = store.feeds.get(store.currentPage)??[]
  } else {
    newsFeed = make_read_feeds(GET_DATA_API(NEWS_URL.replace('@currentPage', store.currentPage)));
    store.feeds.set(store.currentPage,newsFeed)
  }
  const newsTemplate = newsFeed.map(item => `
  <div class="p-6 ${item.read ? 'bg-indigo-300' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
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
  const current_newsFeed : NewsFeed[] = store.feeds.get(store.currentPage)??[];
  current_newsFeed.forEach((feed) => {
    if (feed.id === Number(id)) {
      feed.read = true;
    }
  })
  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>
        <span class="text-blue-800 text-2xl font-bold bg-gray-100">Comments</span>
        {{__comments__}}

      </div>
    </div>`;
  
  function makeComment(comments, stack = 0) {
    const commentString = [];
    for (let i = 0; i < comments.length; i++){
      commentString.push(
          `
          <div style="padding-left : ${stack*40}px" class="mt-4">
            <div class="text-gray-400">
              <i class="fa fa-sort-up mr-2"></i>
              <strong>${comments[i].user}</strong> ${comments[i].time_ago}
            </div>
            <p class="text-gray-700">${comments[i].content}</p>
          </div>  
          `
      )
      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, stack + 1));
      }
    }
    return commentString.join('');
  }
  template = template.replace(`{{__comments__}}`, makeComment(newsContent.comments));
  rootElement.innerHTML = template;
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