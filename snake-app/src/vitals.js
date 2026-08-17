/**
 * VitalsMonitor - Real User Monitoring agent tracking Core Web Vitals
 */
export class VitalsMonitor {
    constructor() {
        this.metrics = {
            cls: 0,
            lcp: 0,
            fid: 0,
            fps: 60
        };
        this.init();
    }

    init() {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

        try {
            // Track LCP (Largest Contentful Paint)
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = Math.round(lastEntry.startTime);
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            // Track CLS (Cumulative Layout Shift)
            const clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        this.metrics.cls += entry.value;
                    }
                }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
            // Ignore observer registration errors on older browser engines
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }
}
