import Router from './core/router'
import { NewsFeedView,NewsDetailView } from './page';
// Element의 subset이 HTMLElement이다.


const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');


router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);
router.route();