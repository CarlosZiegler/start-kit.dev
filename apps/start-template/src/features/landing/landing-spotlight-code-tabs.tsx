"use client";

import type { BundledLanguage } from "shiki";

import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SpotlightTab = {
  value: string;
  label: string;
  language: BundledLanguage;
  code: string;
};

export type LandingSpotlightCodeTabsProps = {
  tabs: SpotlightTab[];
  defaultValue?: string;
};

export const LandingSpotlightCodeTabs = ({
  tabs,
  defaultValue,
}: LandingSpotlightCodeTabsProps) => {
  const initialTab = defaultValue ?? tabs.at(0)?.value;

  if (!initialTab) {
    throw new Error("LandingSpotlightCodeTabs requires at least one tab");
  }

  return (
    <Tabs className="h-full w-full" defaultValue={initialTab}>
      <div className="flex h-full w-full flex-col">
        <div className="px-4 pt-4">
          <TabsList className="w-full" variant="line">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 p-4 pt-3">
          {tabs.map((tab) => (
            <TabsContent className="h-full" key={tab.value} value={tab.value}>
              <div className="h-full overflow-hidden rounded-2xl border border-border/50 bg-background/70">
                <CodeBlock
                  className="h-full"
                  code={tab.code}
                  language={tab.language}
                >
                  <CodeBlockCopyButton aria-label="Copy code" type="button" />
                </CodeBlock>
              </div>
            </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  );
};
