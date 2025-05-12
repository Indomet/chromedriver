import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileX, Info, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Import the ad banner components
import LeftAdBanner from "@/components/LeftAdBanner";
import RightAdBanner from "@/components/RightAdBanner";
import BottomAdBanner from "@/components/BottomAdBanner";

const PLATFORMS = [
  { label: "Win64", value: "win64" },
  { label: "Win32", value: "win32" }
];

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function Index() {
  const [version, setVersion] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0].value);
  const [generated, setGenerated] = useState(true);
  const [error, setError] = useState("");
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null);
  const [detectedBitness, setDetectedBitness] = useState<string | null>(null);
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const adsInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function detectChromeInfo() {
      let dv: string | null = null;
      let db: string | null = null;

      const uaData = (navigator as any).userAgentData;
      if (uaData?.getHighEntropyValues) {
        try {
          // ask for version AND bitness
          const high = await uaData.getHighEntropyValues([
            "fullVersionList",
            "bitness",
          ]);
          const chromeEntry = high.fullVersionList.find((e: any) =>
            /Chrom(e|ium)/i.test(e.brand)
          );
          if (chromeEntry) {
            dv = chromeEntry.version;
          }
          if (high.bitness) {
            // e.g. "64" or "32"
            db = high.bitness;
          }
        } catch {
          // fall back silently
        }
      }

      // fallback version parsing
      if (!dv) {
        const m = navigator.userAgent.match(/Chrome\/([0-9.]+)/);
        dv = m ? m[1] : null;
      }
      // fallback bitness parsing from UA
      if (!db) {
        const ua = navigator.userAgent;
        if (/WOW64|Win64|x64/i.test(ua)) {
          db = "64";
        } else if (/Win32|i686|x86/i.test(ua)) {
          db = "32";
        }
      }

      if (isMounted) {
        setDetectedVersion(dv);
        setDetectedBitness(db);
      }
    }

    detectChromeInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Completely remove our manual initialization logic
    // Let AdSense handle its own initialization through its script
    return () => {
      // Cleanup if needed
    };
  }, []);

  const isValidVersion = (str: string) =>
    /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(str);

  const getDownloadUrl = (v: string, p: string) =>
    `https://storage.googleapis.com/chrome-for-testing-public/${v}/${p}/chromedriver-${p}.zip`;

  const clearError = () => setError("");

  const useDetectedInfo = () => {
    if (detectedVersion && isValidVersion(detectedVersion)) {
      setVersion(detectedVersion);
      setGenerated(true);
    }
    if (detectedBitness) {
      const autoPlatform = detectedBitness === "64" ? "win64" : "win32";
      setPlatform(autoPlatform);
    }
    setError("");
    toast({
      title: "Detected info applied",
      description: [
        detectedVersion && `Version: ${detectedVersion}`,
        detectedBitness && `Platform: ${detectedBitness}-bit`
      ]
        .filter(Boolean)
        .join(" • "),
    });
  };

  const handleClick = () => {
    toast({
      title: "Download started",
      description: `Downloading ${version}_${platform}`,
    });
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newV = e.target.value.trim();
    setVersion(newV);
    setGenerated(isValidVersion(newV));
    setError("");
  };

  const handlePlatformChange = (val: string) => {
    setPlatform(val);
    setGenerated(isValidVersion(version));
    setError("");
  };

  const copyToClipboard = () => {
    const url = `https://storage.googleapis.com/chrome-for-testing-public/${version}/${platform}/chromedriver-${platform}.zip`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "URL has been copied to your clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Could not copy text to clipboard",
        });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 relative">
          <RightAdBanner />

          <main className="flex-1">
            <Card className="w-full shadow-lg border-0 rounded-2xl mb-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold mb-2">
                  ChromeDriver downloader
                </CardTitle>
                <p className="text-gray-500 text-center">
                  Enter your Google Chrome version and select your platform to download the ChromeDriver zip. This downloads directly from official chrome page.
                </p>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <FileX className="h-5 w-5" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {error}
                      <Button variant="outline" size="sm" onClick={clearError} className="mt-2">
                        Dismiss
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-col gap-4 items-stretch"
                  autoComplete="off"
                  spellCheck={false}
                >
                  <label htmlFor="version" className="font-medium text-gray-700 mb-1">
                    Chrome version number
                  </label>
                  <Input
                    id="version"
                    type="text"
                    autoFocus
                    placeholder="e.g. 131.0.6778.140"
                    value={version}
                    onChange={handleVersionChange}
                    autoCorrect="off"
                    inputMode="decimal"
                    pattern="[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+"
                    className="text-base"
                    required
                  />

                  {detectedVersion && (
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        Detected version: <span className="font-semibold">{detectedVersion}</span>
                      </span>
                    </div>
                  )}
                  {detectedBitness && (
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        Detected arch: <span className="font-semibold">{detectedBitness}-bit</span>
                      </span>
                    </div>
                  )}
                  {(detectedVersion || detectedBitness) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={useDetectedInfo}
                      className="w-fit h-7 px-2 mt-2"
                    >
                      Use detected info
                    </Button>
                  )}

                  <div>
                    <span className="block font-medium text-gray-700 mb-1">Platform</span>
                    <RadioGroup
                      value={platform}
                      onValueChange={handlePlatformChange}
                      className="flex gap-4"
                      name="platform"
                      aria-label="Select platform"
                    >
                      {PLATFORMS.map(({ label, value }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
                          <RadioGroupItem value={value} />
                          {label}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </form>

                {generated && isValidVersion(version) && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <a
                      href={getDownloadUrl(version, platform)}
                      download={`${version}_${platform}.zip`}
                      onClick={handleClick}
                      className="w-full"
                    >
                      <Button
                        variant="purple"
                        size="xl"
                        className="w-full select-none shadow-md"
                        style={{ userSelect: "none" }}
                        aria-label="Direct Download ChromeDriver Zip"
                      >
                        <Download size={20} strokeWidth={2.2} />
                        Direct Download ({version}_{platform}.zip)
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert className="bg-blue-50 border-blue-200 w-full">
              <Info className="h-5 w-5 text-blue-500" />
              <AlertTitle className="text-blue-700">ChromeDriver for Testing Info</AlertTitle>
              <AlertDescription className="text-sm text-gray-700">
                <p className="mb-2">You're downloading directly from Google's official 'Chrome for Testing' storage.</p>
                <p className="mb-2">If you know your Chrome version (<code>v</code>) and platform (<code>p</code>), you can download by replacing the placeholders in:</p>
                <div className="relative">
                  <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto mb-2 pr-10">
                    https://storage.googleapis.com/chrome-for-testing-public/$&#123;v&#125;/$&#123;p&#125;/chromedriver-$&#123;p&#125;.zip
                  </pre>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute top-1 right-1 h-7 w-7" 
                    onClick={copyToClipboard}
                    aria-label="Copy URL to clipboard"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p>View the full list of available Chrome-for-Testing versions here (not all specific versions are listed but you can download them by entering the version):<br />
                  <a href="https://googlechromelabs.github.io/chrome-for-testing/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://googlechromelabs.github.io/chrome-for-testing/
                  </a>
                </p>
              </AlertDescription>
            </Alert>

            <BottomAdBanner />
          </main>

          <LeftAdBanner />
        </div>
      </div>
    </div>
  );
}
