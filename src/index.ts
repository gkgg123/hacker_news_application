interface Store {
  currentPage: number;
  feeds: Map<number,NewsFeed[]>
}
interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean;
}

interface NewsDetail extends News {
  readonly comments: NewsComment[];
}

interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
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

function applyAPiMixins(targetClass : any, baseClasses:any[]) :void {
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);
      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    })
  })
}
class Api {
  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();
    return JSON.parse(ajax.response)
  }
}

class NewsFeedApi {
  getData(currentPage : number): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL.replace('@currentPage', String(currentPage)));
  }
}


class NewsDetailApi{
  getData(id:string): NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
  }
}
interface NewsFeedApi extends Api { };
interface NewsDetailApi extends Api { };
applyAPiMixins(NewsFeedApi, [Api]);
applyAPiMixins(NewsDetailApi, [Api]);


class View {
  template: string;
  container: HTMLElement;
  constructor(containerId : string, template : string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
    }
    this.container = containerElement;
    this.template = template;
  }

  updateView(html: string): void {
    this.container.innerHTML = html;
  }
}
class NewsFeedView extends View{
  constructor() {
    const api = new NewsFeedApi();
    let newsFeed :NewsFeed[] = [];
    if (store.feeds.has(store.currentPage)) {
      newsFeed = store.feeds.get(store.currentPage)??[]
    } else {
      newsFeed = make_read_feeds(api.getData(store.currentPage));
      store.feeds.set(store.currentPage,newsFeed)
    }
  }
  make_read_feeds(feeds : NewsFeed[]) : NewsFeed[]{
    return feeds.map((feed) => {
      feed.read = false;
      return feed
    } )
  }
  render() {
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
    template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1))
    template = template.replace('{{__next_page__}}', String(store.currentPage + 1))
    updateView(template)
    
  }
}


class NewsDetailView extends View{
  constructor() {
    const id = location.hash.substr(7);
    const api = new NewsDetailApi()
    const newsContent = api.getData(id);
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
    
    template = template.replace(`{{__comments__}}`, makeComment(newsContent.comments));
    updateView(template)
  }
  makeComment(comments :NewsComment[]) : string {
    const commentString = [];
    for (let i = 0; i < comments.length; i++){
      const comment : NewsComment = comments[i]
      commentString.push(
          `
          <div style="padding-left : ${comment.level*40}px" class="mt-4">
            <div class="text-gray-400">
              <i class="fa fa-sort-up mr-2"></i>
              <strong>${comment.user}</strong> ${comment.time_ago}
            </div>
            <p class="text-gray-700">${comment.content}</p>
          </div>  
          `
      )
      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comment.comments));
      }
    }
    return commentString.join('');
  }
  render() {
    
  }
}



function router() : void {
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