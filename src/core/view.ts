export default abstract class View {
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