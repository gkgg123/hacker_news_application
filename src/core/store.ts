import { NewsFeed } from "../types";

class Store{
  private _feeds: Map<number, NewsFeed[]>
  private _currentPage: number;
  constructor() {
    this._feeds = new Map()
    this._currentPage = 1;
  }
  get currentPage() : number {
    return this._currentPage
  }
  set currentPage(page : number) {
    this._currentPage = page;
  }
  get nextPage() : number {
    return this._currentPage+1
  }
  get prevPage(): number {
    return this._currentPage > 1 ? this._currentPage - 1 : 1;
  }

  set setFeeds(feeds: NewsFeed[]) {
    this._feeds.set(this._currentPage,feeds.map((feed => ({
      ...feed,
      read:false,
    })))) 
  }
  get hasFeeds() {
    return this._feeds.has(this._currentPage)
  }
  get currentfeeds(): NewsFeed[]{
    return this._feeds.get(this._currentPage)??[]
  }
  makeRead(pageNumber : number) {
    this.currentfeeds.forEach((feed) => {
      if (feed.id === pageNumber) {
        feed.read = true;
      }
    })
  }
}

export const store = new Store();