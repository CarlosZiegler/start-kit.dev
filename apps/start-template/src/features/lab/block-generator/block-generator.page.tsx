"use client";

import { useUIStream } from "@json-render/react";
import { Code, Eye, FileCode, Zap } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { generateReactCode } from "./block-generator.codegen";
import { BlockGeneratorPreview } from "./block-generator.preview";
import { BlockGeneratorPrompt } from "./block-generator.prompt";

export function BlockGeneratorPage() {
  const { t } = useTranslation();
  const { tree, isStreaming, error, send, clear } = useUIStream({
    api: "/api/lab/block-generator",
  });

  const handleGenerate = (prompt: string) => {
    clear();
    send(prompt);
  };

  const elementCount = tree ? Object.keys(tree.elements).length : 0;
  const generatedCode = useMemo(
    () => (tree ? generateReactCode(tree) : ""),
    [tree]
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-lg">TanStack AI + useUIStream</h1>
        <Badge variant="secondary">
          <Zap className="mr-1 size-3" />
          useUIStream
        </Badge>
      </div>

      {/* Input */}
      <BlockGeneratorPrompt
        error={error}
        isGenerating={isStreaming}
        onGenerate={handleGenerate}
      />

      {/* Preview & Generated Code */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Preview */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="size-4" />
              {t("LAB_PREVIEW")}
              {isStreaming && (
                <Badge className="ml-2" variant="outline">
                  Streaming...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px] overflow-auto p-6">
            <BlockGeneratorPreview isLoading={isStreaming} tree={tree} />
          </CardContent>
        </Card>

        {/* Generated Code */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode className="size-4" />
              Generated Code
              {isStreaming && (
                <Badge className="ml-2" variant="outline">
                  Updating...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {generatedCode ? (
              <CodeBlock
                className="max-h-[500px] overflow-auto"
                code={generatedCode}
                language="tsx"
                showLineNumbers
              >
                <CodeBlockCopyButton />
              </CodeBlock>
            ) : (
              <p className="text-muted-foreground text-sm">
                Generate a component to see the code
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Parsed Tree */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="size-4" />
              Parsed Tree
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-auto p-4">
            <pre className="text-xs">
              {tree ? JSON.stringify(tree, null, 2) : "No tree yet"}
            </pre>
          </CardContent>
        </Card>

        {/* Stream Status */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4" />
              Stream Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between rounded bg-muted p-2 text-sm">
              <span>Streaming</span>
              <Badge variant={isStreaming ? "default" : "secondary"}>
                {isStreaming ? "Active" : "Idle"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded bg-muted p-2 text-sm">
              <span>Root Element</span>
              <code className="text-xs">{tree?.root || "—"}</code>
            </div>
            <div className="flex items-center justify-between rounded bg-muted p-2 text-sm">
              <span>Elements Count</span>
              <Badge variant="outline">{elementCount}</Badge>
            </div>
            {error && (
              <div className="rounded bg-destructive/10 p-2 text-destructive text-sm">
                Error: {error.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
