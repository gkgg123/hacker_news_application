export default class Router{
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