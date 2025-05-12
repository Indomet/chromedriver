import React, { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";

const LeftAdBanner: React.FC = () => {
  const adInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (adInitialized.current) return;
    
    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
          adInitialized.current = true;
        }
      } catch (error) {
        console.error("Error initializing ad:", error);
      }
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside className="hidden lg:block w-[300px] sticky top-8 h-fit">
      <Card className="overflow-hidden shadow-md" style={{ minHeight: '600px' }}>
        <ins className="adsbygoogle"
          id="ad-banner"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-6126218905254433"
          data-ad-slot="8875353828"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
      </Card>
    </aside>
  );
};

export default LeftAdBanner;
