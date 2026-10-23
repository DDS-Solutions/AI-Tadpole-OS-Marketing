declare module "alpinejs" {
  export interface AlpineInstance {
    data: (name: string, callback: (...args: any[]) => Record<string, any>) => void;
    start: () => void;
    initTree: (element: Element) => void;
    store: (name: string, value?: any) => any;
    nextTick: (callback: () => void) => void;
  }

  const Alpine: AlpineInstance;
  export default Alpine;
}
