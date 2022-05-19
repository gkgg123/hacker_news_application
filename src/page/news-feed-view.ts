import View from "../core/view";
import { NewsFeedApi } from "../core/api";
import { NewsFeed } from "../types";
import { NEWS_URL } from "../config";
import { store } from "../core/store";
export default class NewsFeedView extends View{
    api: NewsFeedApi|null;
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
      this.api = null;
      this.feeds = [];
      
    }
    private makeFeeds(){
      this.feeds.forEach((feed,index) => {
        this.feeds[index].read = false;
      } )
    }
  render(pageNumber: number) {
    store.currentPage = pageNumber;
    this.api = new NewsFeedApi(NEWS_URL.replace('@currentPage', String(store.currentPage)));
      if (store.feeds.has(store.currentPage)) {
        this.feeds = store.feeds.get(store.currentPage)??[]
      } else {
        this.feeds = this.api.getData();
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