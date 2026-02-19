export type JsonRpcId = string | number;

export interface JsonRpcRequest {
  id: JsonRpcId;
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

export interface JsonRpcSuccess {
  id: JsonRpcId;
  jsonrpc: "2.0";
  result: unknown;
}

export interface JsonRpcError {
  error: { code: number; message: string; data?: unknown };
  id: JsonRpcId;
  jsonrpc: "2.0";
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

export interface ToolCallRequest {
  arguments?: Record<string, unknown>;
  name: string;
}

export interface ToolCallResponse {
  error?: string;
  name: string;
  ok: boolean;
  result?: unknown;
}

export interface ModelContextUpdate {
  content: Array<{ type: "text"; text: string }>;
}
