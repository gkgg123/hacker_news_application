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

interface RouteInfo {
  path: string,
  page : View
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


abstract class View {
  private template: string;
  private container: HTMLElement;
  private renderTemplate: string;
  private htmlList: string[];
  constructor(containerId : string, template : string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
    }
    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  }
  protected addHtml(htmlString: string): void{
    this.htmlList.push(htmlString);
  }
  protected getHtml(): string {
    const snapshot = this.htmlList.join('');
    this.clearHtml();
    return snapshot;
  }
  private clearHtml(): void {
    this.htmlList = [];
  }
  protected setTemlateData(key: string, value: string): void{
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`,value)
  }
  abstract render(pageNumber : number): void;
}

class Router{
  routeTable: RouteInfo[];
  defaultRoute: RouteInfo | null;
  constructor() {
    this.routeTable = [];
    this.defaultRoute = null;
    window.addEventListener('hashchange',this.route.bind(this))
  }
  setDefaultPage(page: View): void {
    this.defaultRoute = {path: '',page}
  }
  addRoutePath(path: string, page: View): void {
    this.routeTable.push({ path, page });
  }
  route() {
    const routerPath = location.hash;
    const PageNumber = Number(location.hash.substr(7) || 1)
    if (routerPath === '' && this.defaultRoute) {
      this.defaultRoute.page.render(PageNumber)
    }
    for (const routeInfo of this.routeTable) {
      if (routerPath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render(PageNumber);
        break
      }
    }
  }
}

class NewsFeedView extends View{
  api: NewsFeedApi;
  feeds: NewsFeed[];
  constructor(containerId: string) {
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
    super(containerId, template)
    this.api = new NewsFeedApi();
    this.feeds = [];

  }
  private makeFeeds(){
  this.feeds.forEach((feed,index) => {
      this.feeds[index].read = false;
    } )
  }
  render(pageNumber : number) {
    store.currentPage = pageNumber;
    if (store.feeds.has(store.currentPage)) {
      this.feeds = store.feeds.get(store.currentPage)??[]
    } else {
      this.feeds = this.api.getData(store.currentPage);
      this.makeFeeds();
      store.feeds.set(store.currentPage,this.feeds)
    }
    this.feeds.forEach(item => {
      const { id, title, comments_count, user, points, time_ago, read } = item;
      this.addHtml(
        `<div class="p-6 ${read ? 'bg-indigo-300' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#/show/${id}">${title}</a>  
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class="grid grid-cols-3 text-sm text-gray-500">
          <div><i class="fas fa-user mr-1"></i>${user}</div>
          <div><i class="fas fa-heart mr-1"></i>${points}</div>
          <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
        </div>  
      </div>
    </div>`)
    } 
    )
    this.setTemlateData('news_feed', this.getHtml());
    this.setTemlateData('prev_page', String(store.currentPage > 1 ? store.currentPage - 1 : 1))
    this.setTemlateData('next_page', String(store.currentPage + 1))
    this.updateView()
  }
}


class NewsDetailView extends View{
  constructor(containerId : string) {
    let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>{{__title__}}</h2>
          <div class="text-gray-400 h-20">
            {{__content__}}
          </div>
          <span class="text-blue-800 text-2xl font-bold bg-gray-100">Comments</span>
          {{__comments__}}
  
        </div>
      </div>`;
    super(containerId,template)
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
        commentString.push(this.makeComment(comment.comments));
      }
    }
    return commentString.join('');
  }
  render(pageNumber : number) {
    const api = new NewsDetailApi()
    const newsContent = api.getData(String(pageNumber));
    const current_newsFeed : NewsFeed[] = store.feeds.get(store.currentPage)??[];
    current_newsFeed.forEach((feed) => {
      if (feed.id === Number(pageNumber)) {
        feed.read = true;
      }
    })
    console.log(store.currentPage);
    this.setTemlateData('currentPage', String(store.currentPage));
    this.setTemlateData('title', newsContent.title);
    this.setTemlateData('content', newsContent.content);
    this.setTemlateData(`comments`, this.makeComment(newsContent.comments));
    this.updateView();
  }
}



const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');


router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);
router.route();