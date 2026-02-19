import type { UITree } from "@json-render/core";
import { BLOCK_COMPONENTS } from "./block-generator.components";
import { createImportsFromConfigs } from "./block-generator.config";

type ImportMap = Map<string, Set<string>>;

const COMPONENT_IMPORTS = createImportsFromConfigs(BLOCK_COMPONENTS);

function formatPropValue(value: unknown): string {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return `{${value}}`;
  }
  if (Array.isArray(value) || typeof value === "object") {
    return `{${JSON.stringify(value)}}`;
  }
  return `{${String(value)}}`;
}

function generateElementCode(
  tree: UITree,
  elementKey: string,
  imports: ImportMap,
  indent: number
): string {
  const element = tree.elements[elementKey];
  if (!element) {
    return "";
  }

  const spaces = "  ".repeat(indent);
  const { type, props, children } = element;

  // Track imports (skip layout components with empty imports)
  const importInfo = COMPONENT_IMPORTS[type];
  if (importInfo?.from) {
    if (!imports.has(importInfo.from)) {
      imports.set(importInfo.from, new Set());
    }
    for (const named of importInfo.named) {
      imports.get(importInfo.from)?.add(named);
    }
  }

  // Handle layout components (Flex, Stack, Grid)
  if (type === "Flex" || type === "Stack" || type === "Grid") {
    return generateLayoutCode(tree, element, imports, indent);
  }

  // Handle Card specially
  if (type === "Card") {
    return generateCardCode(tree, element, imports, indent);
  }

  // Handle Button
  if (type === "Button") {
    const { text, variant, size, disabled, className } = props;
    const propsStr = [
      variant && `variant="${variant}"`,
      size && `size="${size}"`,
      disabled && "disabled",
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Button type="button"${propsStr ? ` ${propsStr}` : ""}>${text}</Button>`;
  }

  // Handle Input
  if (type === "Input") {
    const { placeholder, type: inputType, disabled, className } = props;
    const propsStr = [
      inputType && `type="${inputType}"`,
      placeholder && `placeholder="${placeholder}"`,
      disabled && "disabled",
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Input${propsStr ? ` ${propsStr}` : ""} />`;
  }

  // Handle Text
  if (type === "Text") {
    const { content, variant, className } = props;
    const variantClasses: Record<string, string> = {
      default: "text-sm",
      muted: "text-sm text-muted-foreground",
      heading: "text-lg font-semibold",
      subheading: "text-base font-medium",
      label: "text-sm font-medium",
    };
    const cls = variantClasses[(variant as string) ?? "default"] ?? "text-sm";
    const finalClass = className ? `${cls} ${className}` : cls;
    return `${spaces}<p className="${finalClass}">${content}</p>`;
  }

  // Handle Badge
  if (type === "Badge") {
    const { text, variant, className } = props;
    const propsStr = [
      variant && `variant="${variant}"`,
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Badge${propsStr ? ` ${propsStr}` : ""}>${text}</Badge>`;
  }

  // Handle Avatar
  if (type === "Avatar") {
    const { src, fallback, className } = props;
    const lines = [
      `${spaces}<Avatar${className ? ` className="${className}"` : ""}>`,
    ];
    if (src) {
      lines.push(`${spaces}  <AvatarImage src="${src}" />`);
    }
    lines.push(`${spaces}  <AvatarFallback>${fallback}</AvatarFallback>`);
    lines.push(`${spaces}</Avatar>`);
    return lines.join("\n");
  }

  // Handle Progress
  if (type === "Progress") {
    const { value, className } = props;
    return `${spaces}<Progress value={${value}}${className ? ` className="${className}"` : ""} />`;
  }

  // Handle Alert
  if (type === "Alert") {
    const { title, description, variant, className } = props;
    const propsStr = [
      variant && `variant="${variant}"`,
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    const lines = [`${spaces}<Alert${propsStr ? ` ${propsStr}` : ""}>`];
    if (title) {
      lines.push(`${spaces}  <AlertTitle>${title}</AlertTitle>`);
    }
    lines.push(
      `${spaces}  <AlertDescription>${description}</AlertDescription>`
    );
    lines.push(`${spaces}</Alert>`);
    return lines.join("\n");
  }

  // Handle Separator
  if (type === "Separator") {
    const { orientation, className } = props;
    const propsStr = [
      orientation && `orientation="${orientation}"`,
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Separator${propsStr ? ` ${propsStr}` : ""} />`;
  }

  // Handle Checkbox
  if (type === "Checkbox") {
    const { checked, disabled, className } = props;
    const propsStr = [
      checked && "defaultChecked",
      disabled && "disabled",
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Checkbox${propsStr ? ` ${propsStr}` : ""} />`;
  }

  // Handle Switch
  if (type === "Switch") {
    const { checked, disabled, className } = props;
    const propsStr = [
      checked && "defaultChecked",
      disabled && "disabled",
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Switch${propsStr ? ` ${propsStr}` : ""} />`;
  }

  // Handle Textarea
  if (type === "Textarea") {
    const { placeholder, disabled, rows, className } = props;
    const propsStr = [
      placeholder && `placeholder="${placeholder}"`,
      disabled && "disabled",
      rows && `rows={${rows}}`,
      className && `className="${className}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${spaces}<Textarea${propsStr ? ` ${propsStr}` : ""} />`;
  }

  // Handle Label
  if (type === "Label") {
    const { text, className } = props;
    return `${spaces}<Label${className ? ` className="${className}"` : ""}>${text}</Label>`;
  }

  // Fallback generic handler
  const propsEntries = Object.entries(props).filter(
    ([key]) => key !== "children"
  );
  const propsStr = propsEntries
    .map(([key, value]) => `${key}=${formatPropValue(value)}`)
    .join(" ");

  if (children && children.length > 0) {
    const childrenCode = children
      .map((childKey) =>
        generateElementCode(tree, childKey, imports, indent + 1)
      )
      .join("\n");
    return `${spaces}<${type}${propsStr ? ` ${propsStr}` : ""}>\n${childrenCode}\n${spaces}</${type}>`;
  }

  return `${spaces}<${type}${propsStr ? ` ${propsStr}` : ""} />`;
}

function generateLayoutCode(
  tree: UITree,
  element: UITree["elements"][string],
  imports: ImportMap,
  indent: number
): string {
  const spaces = "  ".repeat(indent);
  const { type, props, children } = element;

  let className = "";

  if (type === "Flex") {
    const {
      direction,
      gap,
      align,
      justify,
      wrap,
      className: customClass,
    } = props;
    const classes = ["flex"];
    if (direction === "column") {
      classes.push("flex-col");
    }
    if (gap) {
      classes.push(`gap-${gap}`);
    }
    if (align === "start") {
      classes.push("items-start");
    }
    if (align === "center") {
      classes.push("items-center");
    }
    if (align === "end") {
      classes.push("items-end");
    }
    if (align === "stretch") {
      classes.push("items-stretch");
    }
    if (justify === "start") {
      classes.push("justify-start");
    }
    if (justify === "center") {
      classes.push("justify-center");
    }
    if (justify === "end") {
      classes.push("justify-end");
    }
    if (justify === "between") {
      classes.push("justify-between");
    }
    if (justify === "around") {
      classes.push("justify-around");
    }
    if (wrap) {
      classes.push("flex-wrap");
    }
    if (customClass) {
      classes.push(customClass as string);
    }
    className = classes.join(" ");
  } else if (type === "Stack") {
    const { gap, className: customClass } = props;
    const classes = ["flex", "flex-col"];
    if (gap) {
      classes.push(`gap-${gap}`);
    }
    if (customClass) {
      classes.push(customClass as string);
    }
    className = classes.join(" ");
  } else if (type === "Grid") {
    const { cols = 2, gap, className: customClass } = props;
    const classes = ["grid", `grid-cols-${cols}`];
    if (gap) {
      classes.push(`gap-${gap}`);
    }
    if (customClass) {
      classes.push(customClass as string);
    }
    className = classes.join(" ");
  }

  if (children && children.length > 0) {
    const childrenCode = children
      .map((childKey) =>
        generateElementCode(tree, childKey, imports, indent + 1)
      )
      .join("\n");
    return `${spaces}<div className="${className}">\n${childrenCode}\n${spaces}</div>`;
  }

  return `${spaces}<div className="${className}" />`;
}

function generateCardCode(
  tree: UITree,
  element: UITree["elements"][string],
  imports: ImportMap,
  indent: number
): string {
  const spaces = "  ".repeat(indent);
  const { props, children } = element;
  const { title, description, className } = props;

  const lines: string[] = [];

  lines.push(`${spaces}<Card${className ? ` className="${className}"` : ""}>`);

  if (title || description) {
    lines.push(`${spaces}  <CardHeader>`);
    if (title) {
      lines.push(`${spaces}    <CardTitle>${title}</CardTitle>`);
    }
    if (description) {
      lines.push(
        `${spaces}    <CardDescription>${description}</CardDescription>`
      );
    }
    lines.push(`${spaces}  </CardHeader>`);
  }

  lines.push(`${spaces}  <CardContent>`);

  if (children && children.length > 0) {
    const childrenCode = children
      .map((childKey) =>
        generateElementCode(tree, childKey, imports, indent + 2)
      )
      .join("\n");
    lines.push(childrenCode);
  }

  lines.push(`${spaces}  </CardContent>`);
  lines.push(`${spaces}</Card>`);

  return lines.join("\n");
}

function generateImportsCode(imports: ImportMap): string {
  const lines: string[] = [];

  // Sort imports by path
  const sortedImports = Array.from(imports.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [path, namedImports] of sortedImports) {
    const sortedNamed = Array.from(namedImports).sort();
    if (sortedNamed.length === 1) {
      lines.push(`import { ${sortedNamed.at(0)} } from "${path}";`);
    } else {
      lines.push("import {");
      lines.push(`  ${sortedNamed.join(",\n  ")},`);
      lines.push(`} from "${path}";`);
    }
  }

  return lines.join("\n");
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function generateReactCode(tree: UITree): string {
  const imports: ImportMap = new Map();

  // Generate the JSX content
  const jsxContent = generateElementCode(tree, tree.root, imports, 2);

  // Derive component name from root key
  const componentName = toPascalCase(tree.root);

  // Generate imports
  const importsCode = generateImportsCode(imports);

  // Assemble the full component
  const code = `${importsCode}

export function ${componentName}() {
  return (
${jsxContent}
  );
}
`;

  return code;
}
