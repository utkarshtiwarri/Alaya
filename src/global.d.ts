declare module "react" {
  export type ReactNode = any;
  export type ReactElement = any;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: any): T;
  export function useReducer<R extends (...args: any[]) => any, I>(reducer: R, initialState: I): [ReturnType<R>, Dispatch<SetStateAction<I>>];
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useDebugValue(value: any, format?: (value: any) => string): void;
  export type ChangeEvent<T = Element> = any;
  const React: any;
  export default React;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const jsxDEV: any;
}

declare module "react-dom" {
  const ReactDOM: any;
  export default ReactDOM;
}

declare module "lucide-react" {
  const icons: any;
  export default icons;
  export const Brain: any;
  export const Sparkles: any;
  export const ArrowRight: any;
  export const RefreshCw: any;
  export const Compass: any;
  export const FileText: any;
  export const AlertCircle: any;
  export const Clock: any;
  export const ExternalLink: any;
  export const ChevronRight: any;
  export const Download: any;
  export const BookOpen: any;
}

declare module "motion/react" {
  export const motion: any;
  export const AnimatePresence: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
