import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function DashboardDebugPanel() {
  const [debugInfo, setDebugInfo] = useState({
    navigationEntries: [] as PerformanceNavigationTiming[],
    visibilityState: document.visibilityState,
    sessionStorageKeys: [] as string[],
    hasStateManager: false,
    timestamp: new Date().toISOString(),
  });
  const [isVisible, setIsVisible] = useState(false);

  const updateDebugInfo = () => {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const sessionStorageKeys = Object.keys(sessionStorage).filter(key => key.includes('dashboard'));
    
    setDebugInfo({
      navigationEntries,
      visibilityState: document.visibilityState,
      sessionStorageKeys,
      hasStateManager: true, // We know it exists if this component is rendered
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    updateDebugInfo();
    
    const handleVisibilityChange = () => {
      console.log(`🔍 DebugPanel: Visibility changed to ${document.visibilityState} at ${new Date().toISOString()}`);
      updateDebugInfo();
    };

    const handleFocus = () => {
      console.log(`🔍 DebugPanel: Window focused at ${new Date().toISOString()}`);
      updateDebugInfo();
    };

    const handleLoad = () => {
      console.log(`🔍 DebugPanel: Window loaded at ${new Date().toISOString()}`);
      updateDebugInfo();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleLoad);

    // Update every 2 seconds when visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateDebugInfo();
      }
    }, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('load', handleLoad);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          Debug Dashboard
        </Button>
      </div>
    );
  }

  const currentNavEntry = debugInfo.navigationEntries[0];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Dashboard Debug</CardTitle>
            <div className="flex gap-2">
              <Button onClick={updateDebugInfo} size="sm" variant="outline">
                Refresh
              </Button>
              <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <div className="font-medium mb-1">Last Updated:</div>
            <div className="font-mono text-muted-foreground">{debugInfo.timestamp}</div>
          </div>

          <div>
            <div className="font-medium mb-1">Page Visibility:</div>
            <Badge variant={debugInfo.visibilityState === 'visible' ? 'default' : 'secondary'}>
              {debugInfo.visibilityState}
            </Badge>
          </div>

          <div>
            <div className="font-medium mb-1">Navigation Type:</div>
            <Badge variant={currentNavEntry?.type === 'reload' ? 'destructive' : 'default'}>
              {currentNavEntry?.type || 'none'}
            </Badge>
          </div>

          <div>
            <div className="font-medium mb-1">Navigation Details:</div>
            <div className="font-mono text-muted-foreground bg-muted/50 p-2 rounded text-xs">
              {currentNavEntry ? (
                <pre>
{`Type: ${currentNavEntry.type}
Redirects: ${currentNavEntry.redirectCount}
Start: ${currentNavEntry.startTime.toFixed(2)}
Load End: ${currentNavEntry.loadEventEnd.toFixed(2)}`}
                </pre>
              ) : (
                'No navigation entry'
              )}
            </div>
          </div>

          <div>
            <div className="font-medium mb-1">Session Storage Keys:</div>
            <div className="space-y-1">
              {debugInfo.sessionStorageKeys.length > 0 ? (
                debugInfo.sessionStorageKeys.map(key => (
                  <div key={key} className="font-mono text-muted-foreground bg-muted/50 p-1 rounded text-xs">
                    {key}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No dashboard keys found</div>
              )}
            </div>
          </div>

          <div>
            <div className="font-medium mb-1">Actions:</div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('🔍 Manual navigation check:', performance.getEntriesByType('navigation'));
                  console.log('🔍 Manual session storage:', Object.keys(sessionStorage));
                  console.log('🔍 Manual visibility:', document.visibilityState);
                }}
              >
                Log All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  sessionStorage.clear();
                  console.log('🗑️ Cleared all session storage');
                  updateDebugInfo();
                }}
              >
                Clear Storage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}