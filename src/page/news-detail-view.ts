import View from '../core/view'
import { NewsComment,NewsDetail,NewsFeed } from '../types';
import { NewsDetailApi } from '../core/api';
import { CONTENT_URL } from '../config';
import {store} from '../core/store'
export default class NewsDetailView extends View{
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
      const api = new NewsDetailApi(CONTENT_URL.replace('@id', String(pageNumber)))
      api.getDataWithPromise((data: NewsDetail) => {
        const { title, content, comments } = data;
        store.makeRead(pageNumber);
        this.setTemlateData('currentPage', String(store.currentPage));
        this.setTemlateData('title', title);
        this.setTemlateData('content', content);
        this.setTemlateData(`comments`, this.makeComment(comments));
        this.updateView();
      })
    }
  }
  