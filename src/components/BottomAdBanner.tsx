import React, { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";

const BottomAdBanner: React.FC = () => {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const el = insRef.current;
        if (el && !el.getAttribute('data-adsbygoogle-status') && !el.dataset.adLoaded) {
          el.dataset.adLoaded = "1";
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        }
      } catch (error) {
        // Silently handle ad blockers
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-8" aria-label="Bottom ad banner">
      <Card className="overflow-hidden shadow-md" style={{ minHeight: '250px' }}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          id="chromedriver-ad-bottom"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-6126218905254433"
          data-ad-slot="8875353828"
          data-ad-channel="chromedriver_bottom_banner"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </Card>
    </div>
  );
};

export default BottomAdBanner;
