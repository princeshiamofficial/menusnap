export { };

declare global {
    interface Window {
        fbq: {
            (...args: any[]): void;
            push: (...args: any[]) => void;
            loaded: boolean;
            version: string;
            queue: any[];
            q?: any[];
        };
        _fbq: any;
    }
    namespace JSX {
        interface IntrinsicElements {
            'lottie-player': any;
        }
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'lottie-player': any;
            }
        }
    }
}
