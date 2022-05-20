import { NewsFeed,NewsDetail } from "../types";


export class Api {
  xhr: XMLHttpRequest;
  url: string;
  constructor(url: string) {
    this.xhr = new XMLHttpRequest();
    this.url = url;
  }

  async request<AjaxResponse>() :Promise<AjaxResponse> {
    const response = await fetch(this.url)
    return await response.json() as AjaxResponse;
  }
}

export class NewsFeedApi extends Api {
  constructor(url : string) {
    super(url)
  }

  async getData(): Promise<NewsFeed[]> {
    return await this.request<NewsFeed[]>();
  }
}


export class NewsDetailApi extends Api{
  constructor(url: string) {
    super(url);
  }
  async getData(): Promise<NewsDetail> {
    return await this.request<NewsDetail>();
  }
}