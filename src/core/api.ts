import { NewsFeed,NewsDetail } from "../types";


export class Api {
  xhr: XMLHttpRequest;
  url: string;
  constructor(url: string) {
    this.xhr = new XMLHttpRequest();
    this.url = url;
  }
  getRequestWithXHR<AjaxResponse>(cb : (data : AjaxResponse) => void): void {
    this.xhr.open('GET', this.url);
    this.xhr.addEventListener('load', () => {
      cb(JSON.parse(this.xhr.response));
    })
    this.xhr.send();
  }
}

export class NewsFeedApi extends Api {
  constructor(url : string) {
    super(url)
  }
  getData(cb : (data : NewsFeed[]) => void): void {
    return this.getRequestWithXHR<NewsFeed[]>(cb);
  }
}


export class NewsDetailApi extends Api{
  constructor(url: string) {
    super(url);
  }
  getData(cb : (data : NewsDetail)=>void): void {
    return this.getRequestWithXHR<NewsDetail>(cb);
  }
}