import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  type ComponentConfig,
  defineComponent,
} from "./block-generator.config";

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

const FlexComponent = defineComponent({
  name: "Flex",
  schema: z.object({
    direction: z.enum(["row", "column"]).default("row"),
    gap: z.number().optional(),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
    justify: z.enum(["start", "center", "end", "between", "around"]).optional(),
    wrap: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "", named: [] },
  hasChildren: true,
  description: "Flexbox container for horizontal/vertical layouts",
  render: ({ element, children }) => {
    const { direction, gap, align, justify, wrap, className } = element.props;
    return (
      <div
        className={cn(
          "flex",
          direction === "column" && "flex-col",
          gap && `gap-${gap}`,
          align === "start" && "items-start",
          align === "center" && "items-center",
          align === "end" && "items-end",
          align === "stretch" && "items-stretch",
          justify === "start" && "justify-start",
          justify === "center" && "justify-center",
          justify === "end" && "justify-end",
          justify === "between" && "justify-between",
          justify === "around" && "justify-around",
          wrap && "flex-wrap",
          className
        )}
      >
        {children}
      </div>
    );
  },
});

const StackComponent = defineComponent({
  name: "Stack",
  schema: z.object({
    gap: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "", named: [] },
  hasChildren: true,
  description: "Vertical stack (shorthand for Flex column)",
  render: ({ element, children }) => {
    const { gap, className } = element.props;
    return (
      <div className={cn("flex flex-col", gap && `gap-${gap}`, className)}>
        {children}
      </div>
    );
  },
});

const GridComponent = defineComponent({
  name: "Grid",
  schema: z.object({
    cols: z.number().min(1).max(12).default(2),
    gap: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "", named: [] },
  hasChildren: true,
  description: "CSS Grid container with specified columns",
  render: ({ element, children }) => {
    const { cols = 2, gap, className } = element.props;
    const gridColsClass =
      {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        7: "grid-cols-7",
        8: "grid-cols-8",
        9: "grid-cols-9",
        10: "grid-cols-10",
        11: "grid-cols-11",
        12: "grid-cols-12",
      }[cols as number] ?? "grid-cols-2";

    return (
      <div
        className={cn("grid", gridColsClass, gap && `gap-${gap}`, className)}
      >
        {children}
      </div>
    );
  },
});

// =============================================================================
// CORE UI COMPONENTS
// =============================================================================

const CardComponent = defineComponent({
  name: "Card",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/card",
    named: [
      "Card",
      "CardContent",
      "CardDescription",
      "CardHeader",
      "CardTitle",
    ],
  },
  hasChildren: true,
  description: "Card container with optional header title and description",
  render: ({ element, children }) => {
    const { title, description, className } = element.props;
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    );
  },
});

const ButtonComponent = defineComponent({
  name: "Button",
  schema: z.object({
    text: z.string(),
    variant: z
      .enum(["default", "outline", "secondary", "ghost", "destructive"])
      .optional(),
    size: z.enum(["default", "sm", "lg", "icon"]).optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/button", named: ["Button"] },
  hasChildren: false,
  description: "Clickable button with various styles",
  render: ({ element }) => {
    const { text, variant, size, disabled, className } = element.props;
    return (
      <Button
        className={className}
        disabled={disabled}
        size={size}
        type="button"
        variant={variant}
      >
        {text}
      </Button>
    );
  },
});

const BadgeComponent = defineComponent({
  name: "Badge",
  schema: z.object({
    text: z.string(),
    variant: z
      .enum(["default", "secondary", "destructive", "outline"])
      .optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/badge", named: ["Badge"] },
  hasChildren: false,
  description: "Small status badge or label",
  render: ({ element }) => {
    const { text, variant, className } = element.props;
    return (
      <Badge className={className} variant={variant}>
        {text}
      </Badge>
    );
  },
});

const InputComponent = defineComponent({
  name: "Input",
  schema: z.object({
    placeholder: z.string().optional(),
    type: z.enum(["text", "email", "password", "number"]).optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/input", named: ["Input"] },
  hasChildren: false,
  description: "Text input field",
  render: ({ element }) => {
    const { placeholder, type, disabled, className } = element.props;
    return (
      <Input
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        type={type}
      />
    );
  },
});

const TextComponent = defineComponent({
  name: "Text",
  schema: z.object({
    content: z.string(),
    variant: z
      .enum(["default", "muted", "heading", "subheading", "label"])
      .optional(),
    className: z.string().optional(),
  }),
  imports: { from: "", named: [] },
  hasChildren: false,
  description: "Text content with styling variants",
  render: ({ element }) => {
    const { content, variant = "default", className } = element.props;
    const variantClasses = {
      default: "text-sm",
      muted: "text-sm text-muted-foreground",
      heading: "text-lg font-semibold",
      subheading: "text-base font-medium",
      label: "text-sm font-medium",
    };
    return (
      <p
        className={cn(
          variantClasses[variant as keyof typeof variantClasses] ??
            variantClasses.default,
          className
        )}
      >
        {content}
      </p>
    );
  },
});

const SeparatorComponent = defineComponent({
  name: "Separator",
  schema: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/separator", named: ["Separator"] },
  hasChildren: false,
  description: "Visual divider line",
  render: ({ element }) => {
    const { orientation, className } = element.props;
    return <Separator className={className} orientation={orientation} />;
  },
});

const AvatarComponent = defineComponent({
  name: "Avatar",
  schema: z.object({
    src: z.string().optional(),
    fallback: z.string(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/avatar",
    named: ["Avatar", "AvatarFallback", "AvatarImage"],
  },
  hasChildren: false,
  description: "User avatar with image or fallback initials",
  render: ({ element }) => {
    const { src, fallback, className } = element.props;
    return (
      <Avatar className={className}>
        {src && <AvatarImage src={src} />}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    );
  },
});

const ProgressComponent = defineComponent({
  name: "Progress",
  schema: z.object({
    value: z.number().min(0).max(100),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/progress", named: ["Progress"] },
  hasChildren: false,
  description: "Progress bar indicator",
  render: ({ element }) => {
    const { value, className } = element.props;
    return <Progress className={className} value={value} />;
  },
});

const AlertComponent = defineComponent({
  name: "Alert",
  schema: z.object({
    title: z.string().optional(),
    description: z.string(),
    variant: z.enum(["default", "destructive"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/alert",
    named: ["Alert", "AlertDescription", "AlertTitle"],
  },
  hasChildren: false,
  description: "Alert message with title and description",
  render: ({ element }) => {
    const { title, description, variant, className } = element.props;
    return (
      <Alert className={className} variant={variant}>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    );
  },
});

// =============================================================================
// FORM COMPONENTS
// =============================================================================

const CheckboxComponent = defineComponent({
  name: "Checkbox",
  schema: z.object({
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/checkbox", named: ["Checkbox"] },
  hasChildren: false,
  description: "Checkbox input for boolean values",
  render: ({ element }) => {
    const { checked, disabled, className } = element.props;
    return (
      <Checkbox checked={checked} className={className} disabled={disabled} />
    );
  },
});

const SwitchComponent = defineComponent({
  name: "Switch",
  schema: z.object({
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    size: z.enum(["default", "sm", "lg"]).optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/switch", named: ["Switch"] },
  hasChildren: false,
  description: "Toggle switch for on/off states",
  render: ({ element }) => {
    const { checked, disabled, size, className } = element.props;
    return (
      <Switch
        checked={checked}
        className={className}
        disabled={disabled}
        size={size}
      />
    );
  },
});

const SelectComponent = defineComponent({
  name: "Select",
  schema: z.object({
    placeholder: z.string().optional(),
    options: z.array(z.object({ value: z.string(), label: z.string() })),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/select",
    named: [
      "Select",
      "SelectContent",
      "SelectItem",
      "SelectTrigger",
      "SelectValue",
    ],
  },
  hasChildren: false,
  description: "Dropdown select with options",
  render: ({ element }) => {
    const { placeholder, options, disabled, className } = element.props;
    const items = (options as Array<{ value: string; label: string }>) ?? [];
    return (
      <Select disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue>{placeholder}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
});

const RadioGroupComponent = defineComponent({
  name: "RadioGroup",
  schema: z.object({
    options: z.array(z.object({ value: z.string(), label: z.string() })),
    defaultValue: z.string().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/radio-group",
    named: ["RadioGroup", "RadioGroupItem"],
  },
  hasChildren: false,
  description: "Radio button group for single selection",
  render: ({ element }) => {
    const { options, defaultValue, disabled, className } = element.props;
    const items = (options as Array<{ value: string; label: string }>) ?? [];
    return (
      <RadioGroup
        className={className}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        {items.map((option) => (
          <div className="flex items-center gap-2" key={option.value}>
            <RadioGroupItem value={option.value} />
            <Label>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  },
});

const TextareaComponent = defineComponent({
  name: "Textarea",
  schema: z.object({
    placeholder: z.string().optional(),
    disabled: z.boolean().optional(),
    rows: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/textarea", named: ["Textarea"] },
  hasChildren: false,
  description: "Multi-line text input",
  render: ({ element }) => {
    const { placeholder, disabled, rows, className } = element.props;
    return (
      <Textarea
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
      />
    );
  },
});

const LabelComponent = defineComponent({
  name: "Label",
  schema: z.object({
    text: z.string(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/label", named: ["Label"] },
  hasChildren: false,
  description: "Form field label",
  render: ({ element }) => {
    const { text, className } = element.props;
    return <Label className={className}>{text}</Label>;
  },
});

const SliderComponent = defineComponent({
  name: "Slider",
  schema: z.object({
    defaultValue: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/slider", named: ["Slider"] },
  hasChildren: false,
  description: "Range slider input",
  render: ({ element }) => {
    const { defaultValue, min, max, step, disabled, className } = element.props;
    return (
      <Slider
        className={className}
        defaultValue={defaultValue ? [defaultValue] : [50]}
        disabled={disabled}
        max={max}
        min={min}
        step={step}
      />
    );
  },
});

// =============================================================================
// DISPLAY COMPONENTS
// =============================================================================

const AccordionComponent = defineComponent({
  name: "Accordion",
  schema: z.object({
    items: z.array(
      z.object({ value: z.string(), title: z.string(), content: z.string() })
    ),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/accordion",
    named: [
      "Accordion",
      "AccordionContent",
      "AccordionItem",
      "AccordionTrigger",
    ],
  },
  hasChildren: false,
  description: "Collapsible accordion sections",
  render: ({ element }) => {
    const { items, className } = element.props;
    const accordionItems =
      (items as Array<{ value: string; title: string; content: string }>) ?? [];
    return (
      <Accordion className={className}>
        {accordionItems.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  },
});

const TabsComponent = defineComponent({
  name: "Tabs",
  schema: z.object({
    tabs: z.array(
      z.object({ value: z.string(), label: z.string(), content: z.string() })
    ),
    defaultValue: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/tabs",
    named: ["Tabs", "TabsContent", "TabsList", "TabsTrigger"],
  },
  hasChildren: false,
  description: "Tab navigation with content panels",
  render: ({ element }) => {
    const { tabs, defaultValue, className } = element.props;
    const tabItems =
      (tabs as Array<{ value: string; label: string; content: string }>) ?? [];
    const firstTab = tabItems.at(0)?.value;
    return (
      <Tabs className={className} defaultValue={defaultValue ?? firstTab}>
        <TabsList>
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabItems.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  },
});

const TableComponent = defineComponent({
  name: "Table",
  schema: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    caption: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/table",
    named: [
      "Table",
      "TableBody",
      "TableCaption",
      "TableCell",
      "TableHead",
      "TableHeader",
      "TableRow",
    ],
  },
  hasChildren: false,
  description: "Data table with headers and rows",
  render: ({ element }) => {
    const { headers, rows, caption, className } = element.props;
    const headerItems = (headers as string[]) ?? [];
    const rowItems = (rows as string[][]) ?? [];
    return (
      <Table className={className}>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {headerItems.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowItems.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
});

const SkeletonComponent = defineComponent({
  name: "Skeleton",
  schema: z.object({
    width: z.string().optional(),
    height: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/skeleton", named: ["Skeleton"] },
  hasChildren: false,
  description: "Loading placeholder skeleton",
  render: ({ element }) => {
    const { width, height, className } = element.props;
    return (
      <Skeleton
        className={cn(
          className,
          width && `w-[${width}]`,
          height && `h-[${height}]`
        )}
      />
    );
  },
});

const TooltipComponent = defineComponent({
  name: "Tooltip",
  schema: z.object({
    content: z.string(),
    side: z.enum(["top", "right", "bottom", "left"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/tooltip",
    named: ["Tooltip", "TooltipContent", "TooltipTrigger"],
  },
  hasChildren: true,
  description: "Hover tooltip with content",
  render: ({ element, children }) => {
    const { content, side, className } = element.props;
    return (
      <Tooltip>
        <TooltipTrigger render={<span />}>{children}</TooltipTrigger>
        <TooltipContent className={className} side={side}>
          {content}
        </TooltipContent>
      </Tooltip>
    );
  },
});

const ScrollAreaComponent = defineComponent({
  name: "ScrollArea",
  schema: z.object({
    height: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/scroll-area", named: ["ScrollArea"] },
  hasChildren: true,
  description: "Scrollable container area",
  render: ({ element, children }) => {
    const { height, className } = element.props;
    return (
      <ScrollArea className={cn(className, height && `h-[${height}]`)}>
        {children}
      </ScrollArea>
    );
  },
});

// =============================================================================
// OVERLAY COMPONENTS
// =============================================================================

const DialogComponent = defineComponent({
  name: "Dialog",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    trigger: z.string(),
    footer: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/dialog",
    named: [
      "Dialog",
      "DialogContent",
      "DialogDescription",
      "DialogFooter",
      "DialogHeader",
      "DialogTitle",
      "DialogTrigger",
    ],
  },
  hasChildren: true,
  description: "Modal dialog with trigger button",
  render: ({ element, children }) => {
    const { title, description, trigger, footer, className } = element.props;
    return (
      <Dialog>
        <DialogTrigger render={<Button type="button" variant="outline" />}>
          {trigger}
        </DialogTrigger>
        <DialogContent className={className}>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  },
});

const SheetComponent = defineComponent({
  name: "Sheet",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    trigger: z.string(),
    side: z.enum(["top", "right", "bottom", "left"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/sheet",
    named: [
      "Sheet",
      "SheetContent",
      "SheetDescription",
      "SheetFooter",
      "SheetHeader",
      "SheetTitle",
      "SheetTrigger",
    ],
  },
  hasChildren: true,
  description: "Slide-out sheet panel",
  render: ({ element, children }) => {
    const {
      title,
      description,
      trigger,
      side = "right",
      className,
    } = element.props;
    return (
      <Sheet>
        <SheetTrigger render={<Button type="button" variant="outline" />}>
          {trigger}
        </SheetTrigger>
        <SheetContent className={className} side={side}>
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          {children}
          <SheetFooter />
        </SheetContent>
      </Sheet>
    );
  },
});

const PopoverComponent = defineComponent({
  name: "Popover",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    trigger: z.string(),
    side: z.enum(["top", "right", "bottom", "left"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/popover",
    named: [
      "Popover",
      "PopoverContent",
      "PopoverDescription",
      "PopoverHeader",
      "PopoverTitle",
      "PopoverTrigger",
    ],
  },
  hasChildren: true,
  description: "Floating popover panel",
  render: ({ element, children }) => {
    const { title, description, trigger, side, className } = element.props;
    return (
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" />}>
          {trigger}
        </PopoverTrigger>
        <PopoverContent className={className} side={side}>
          {(title || description) && (
            <PopoverHeader>
              {title && <PopoverTitle>{title}</PopoverTitle>}
              {description && (
                <PopoverDescription>{description}</PopoverDescription>
              )}
            </PopoverHeader>
          )}
          {children}
        </PopoverContent>
      </Popover>
    );
  },
});

const DropdownMenuComponent = defineComponent({
  name: "DropdownMenu",
  schema: z.object({
    trigger: z.string(),
    label: z.string().optional(),
    items: z.array(z.object({ label: z.string() })),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/dropdown-menu",
    named: [
      "DropdownMenu",
      "DropdownMenuContent",
      "DropdownMenuItem",
      "DropdownMenuLabel",
      "DropdownMenuSeparator",
      "DropdownMenuTrigger",
    ],
  },
  hasChildren: false,
  description: "Dropdown menu with items",
  render: ({ element }) => {
    const { trigger, label, items, className } = element.props;
    const menuItems = (items as Array<{ label: string }>) ?? [];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" />}
        >
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent className={className}>
          {label && (
            <>
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index}>{item.label}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});

const AlertDialogComponent = defineComponent({
  name: "AlertDialog",
  schema: z.object({
    trigger: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    cancelText: z.string().optional(),
    actionText: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/alert-dialog",
    named: [
      "AlertDialog",
      "AlertDialogAction",
      "AlertDialogCancel",
      "AlertDialogContent",
      "AlertDialogDescription",
      "AlertDialogFooter",
      "AlertDialogHeader",
      "AlertDialogTitle",
      "AlertDialogTrigger",
    ],
  },
  hasChildren: false,
  description: "Confirmation alert dialog",
  render: ({ element }) => {
    const {
      trigger,
      title,
      description,
      cancelText = "Cancel",
      actionText = "Continue",
      className,
    } = element.props;
    return (
      <AlertDialog>
        <AlertDialogTrigger render={<Button type="button" variant="outline" />}>
          {trigger}
        </AlertDialogTrigger>
        <AlertDialogContent className={className}>
          <AlertDialogHeader>
            {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {description && (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelText}</AlertDialogCancel>
            <AlertDialogAction type="button">{actionText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
});

// =============================================================================
// ADDITIONAL COMPONENTS
// =============================================================================

const AspectRatioComponent = defineComponent({
  name: "AspectRatio",
  schema: z.object({
    ratio: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/aspect-ratio", named: ["AspectRatio"] },
  hasChildren: true,
  description: "Container with fixed aspect ratio",
  render: ({ element, children }) => {
    const { ratio = 16 / 9, className } = element.props;
    return (
      <AspectRatio className={className} ratio={ratio}>
        {children}
      </AspectRatio>
    );
  },
});

const BreadcrumbComponent = defineComponent({
  name: "Breadcrumb",
  schema: z.object({
    items: z.array(
      z.object({ label: z.string(), href: z.string().optional() })
    ),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/breadcrumb",
    named: [
      "Breadcrumb",
      "BreadcrumbItem",
      "BreadcrumbLink",
      "BreadcrumbList",
      "BreadcrumbPage",
      "BreadcrumbSeparator",
    ],
  },
  hasChildren: false,
  description: "Navigation breadcrumb trail",
  render: ({ element }) => {
    const { items, className } = element.props;
    const breadcrumbItems =
      (items as Array<{ label: string; href?: string }>) ?? [];
    return (
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
});

const ButtonGroupComponent = defineComponent({
  name: "ButtonGroup",
  schema: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/button-group",
    named: ["ButtonGroup", "ButtonGroupSeparator"],
  },
  hasChildren: true,
  description: "Group of buttons",
  render: ({ element, children }) => {
    const { orientation = "horizontal", className } = element.props;
    return (
      <ButtonGroup className={className} orientation={orientation}>
        {children}
      </ButtonGroup>
    );
  },
});

const ButtonGroupSeparatorComponent = defineComponent({
  name: "ButtonGroupSeparator",
  schema: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/button-group",
    named: ["ButtonGroupSeparator"],
  },
  hasChildren: false,
  description: "Separator between button group items",
  render: ({ element }) => {
    const { orientation = "vertical", className } = element.props;
    return (
      <ButtonGroupSeparator className={className} orientation={orientation} />
    );
  },
});

const CalendarComponent = defineComponent({
  name: "Calendar",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/calendar", named: ["Calendar"] },
  hasChildren: false,
  description: "Date picker calendar",
  render: ({ element }) => {
    const { className } = element.props;
    return <Calendar className={className} />;
  },
});

const CarouselComponent = defineComponent({
  name: "Carousel",
  schema: z.object({
    items: z.array(z.object({ content: z.string() })),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/carousel",
    named: [
      "Carousel",
      "CarouselContent",
      "CarouselItem",
      "CarouselNext",
      "CarouselPrevious",
    ],
  },
  hasChildren: false,
  description: "Carousel slider with navigation",
  render: ({ element }) => {
    const { items, className } = element.props;
    const carouselItems = (items as Array<{ content: string }>) ?? [];
    return (
      <Carousel className={cn("w-full max-w-xs", className)}>
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="font-semibold text-4xl">
                      {item.content}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious type="button" />
        <CarouselNext type="button" />
      </Carousel>
    );
  },
});

const CollapsibleComponent = defineComponent({
  name: "Collapsible",
  schema: z.object({
    trigger: z.string(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/collapsible",
    named: ["Collapsible", "CollapsibleContent", "CollapsibleTrigger"],
  },
  hasChildren: true,
  description: "Collapsible content section",
  render: ({ element, children }) => {
    const { trigger, className } = element.props;
    return (
      <Collapsible className={className}>
        <CollapsibleTrigger render={<Button type="button" variant="ghost" />}>
          {trigger}
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    );
  },
});

const CommandComponent = defineComponent({
  name: "Command",
  schema: z.object({
    placeholder: z.string().optional(),
    items: z.array(
      z.object({
        group: z.string().optional(),
        label: z.string(),
        value: z.string(),
      })
    ),
    emptyText: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/command",
    named: [
      "Command",
      "CommandEmpty",
      "CommandGroup",
      "CommandInput",
      "CommandItem",
      "CommandList",
      "CommandSeparator",
    ],
  },
  hasChildren: false,
  description: "Command palette with search",
  render: ({ element }) => {
    const {
      placeholder,
      items,
      emptyText = "No results found.",
      className,
    } = element.props;
    const commandItems =
      (items as Array<{ group?: string; label: string; value: string }>) ?? [];
    const groupedItems = commandItems.reduce(
      (acc, item) => {
        const group = item.group ?? "default";
        acc[group] = acc[group] ?? [];
        acc[group].push(item);
        return acc;
      },
      {} as Record<string, typeof commandItems>
    );
    return (
      <Command className={cn("rounded-lg border shadow-md", className)}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          {Object.entries(groupedItems).map(([group, groupItems], index) => (
            <CommandGroup
              heading={group !== "default" ? group : undefined}
              key={group}
            >
              {index > 0 && <CommandSeparator />}
              {groupItems.map((item) => (
                <CommandItem key={item.value}>{item.label}</CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    );
  },
});

const ContextMenuComponent = defineComponent({
  name: "ContextMenu",
  schema: z.object({
    items: z.array(z.object({ label: z.string() })),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/context-menu",
    named: [
      "ContextMenu",
      "ContextMenuContent",
      "ContextMenuItem",
      "ContextMenuTrigger",
    ],
  },
  hasChildren: true,
  description: "Right-click context menu",
  render: ({ element, children }) => {
    const { items, className } = element.props;
    const menuItems = (items as Array<{ label: string }>) ?? [];
    return (
      <ContextMenu>
        <ContextMenuTrigger className={className}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {menuItems.map((item, index) => (
            <ContextMenuItem key={index}>{item.label}</ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  },
});

const EmptyComponent = defineComponent({
  name: "Empty",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/empty",
    named: [
      "Empty",
      "EmptyContent",
      "EmptyDescription",
      "EmptyHeader",
      "EmptyMedia",
      "EmptyTitle",
    ],
  },
  hasChildren: false,
  description: "Empty state placeholder",
  render: ({ element }) => {
    const { title, description, icon, className } = element.props;
    return (
      <Empty className={className}>
        <EmptyHeader>
          {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
          {title && <EmptyTitle>{title}</EmptyTitle>}
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  },
});

const FieldComponent = defineComponent({
  name: "Field",
  schema: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/field",
    named: [
      "Field",
      "FieldContent",
      "FieldDescription",
      "FieldError",
      "FieldGroup",
      "FieldLabel",
    ],
  },
  hasChildren: true,
  description: "Form field wrapper",
  render: ({ element, children }) => {
    const { orientation = "vertical", className } = element.props;
    return (
      <Field className={className} orientation={orientation}>
        {children}
      </Field>
    );
  },
});

const FieldGroupComponent = defineComponent({
  name: "FieldGroup",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/field", named: ["FieldGroup"] },
  hasChildren: true,
  description: "Group of form fields",
  render: ({ element, children }) => {
    const { className } = element.props;
    return <FieldGroup className={className}>{children}</FieldGroup>;
  },
});

const FieldLabelComponent = defineComponent({
  name: "FieldLabel",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/field", named: ["FieldLabel"] },
  hasChildren: true,
  description: "Form field label",
  render: ({ element, children }) => {
    const { className } = element.props;
    return <FieldLabel className={className}>{children}</FieldLabel>;
  },
});

const FieldDescriptionComponent = defineComponent({
  name: "FieldDescription",
  schema: z.object({
    text: z.string(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/field", named: ["FieldDescription"] },
  hasChildren: false,
  description: "Form field description text",
  render: ({ element }) => {
    const { text, className } = element.props;
    return <FieldDescription className={className}>{text}</FieldDescription>;
  },
});

const FieldErrorComponent = defineComponent({
  name: "FieldError",
  schema: z.object({
    message: z.string(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/field", named: ["FieldError"] },
  hasChildren: false,
  description: "Form field error message",
  render: ({ element }) => {
    const { message, className } = element.props;
    return <FieldError className={className}>{message}</FieldError>;
  },
});

const FieldContentComponent = defineComponent({
  name: "FieldContent",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/field", named: ["FieldContent"] },
  hasChildren: true,
  description: "Form field content container",
  render: ({ element, children }) => {
    const { className } = element.props;
    return <FieldContent className={className}>{children}</FieldContent>;
  },
});

const HoverCardComponent = defineComponent({
  name: "HoverCard",
  schema: z.object({
    content: z.string(),
    side: z.enum(["top", "right", "bottom", "left"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/hover-card",
    named: ["HoverCard", "HoverCardContent", "HoverCardTrigger"],
  },
  hasChildren: true,
  description: "Hover-triggered card popup",
  render: ({ element, children }) => {
    const { content, side = "bottom", className } = element.props;
    return (
      <HoverCard>
        <HoverCardTrigger>{children}</HoverCardTrigger>
        <HoverCardContent className={className} side={side}>
          {content}
        </HoverCardContent>
      </HoverCard>
    );
  },
});

const InputGroupComponent = defineComponent({
  name: "InputGroup",
  schema: z.object({
    placeholder: z.string().optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/input-group",
    named: [
      "InputGroup",
      "InputGroupAddon",
      "InputGroupButton",
      "InputGroupInput",
    ],
  },
  hasChildren: false,
  description: "Input with prefix/suffix addons",
  render: ({ element }) => {
    const { placeholder, prefix, suffix, className } = element.props;
    return (
      <InputGroup className={className}>
        {prefix && (
          <InputGroupAddon align="inline-start">{prefix}</InputGroupAddon>
        )}
        <InputGroupInput placeholder={placeholder} />
        {suffix && (
          <InputGroupAddon align="inline-end">{suffix}</InputGroupAddon>
        )}
      </InputGroup>
    );
  },
});

const InputGroupButtonComponent = defineComponent({
  name: "InputGroupButton",
  schema: z.object({
    text: z.string(),
    variant: z.enum(["default", "ghost", "outline"]).optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/input-group", named: ["InputGroupButton"] },
  hasChildren: false,
  description: "Button addon for input group",
  render: ({ element }) => {
    const { text, variant = "ghost", className } = element.props;
    return (
      <InputGroupButton className={className} variant={variant}>
        {text}
      </InputGroupButton>
    );
  },
});

const InputOTPComponent = defineComponent({
  name: "InputOTP",
  schema: z.object({
    length: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/input-otp",
    named: ["InputOTP", "InputOTPGroup", "InputOTPSlot"],
  },
  hasChildren: false,
  description: "One-time password input",
  render: ({ element }) => {
    const { length = 6, className } = element.props;
    return (
      <InputOTP className={className} maxLength={length}>
        <InputOTPGroup>
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot index={index} key={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    );
  },
});

const ItemComponent = defineComponent({
  name: "Item",
  schema: z.object({
    variant: z.enum(["default", "outline"]).optional(),
    size: z.enum(["default", "sm", "lg"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/item",
    named: [
      "Item",
      "ItemActions",
      "ItemContent",
      "ItemDescription",
      "ItemGroup",
      "ItemMedia",
      "ItemTitle",
    ],
  },
  hasChildren: true,
  description: "List item container",
  render: ({ element, children }) => {
    const { variant = "default", size = "default", className } = element.props;
    return (
      <Item className={className} size={size} variant={variant}>
        {children}
      </Item>
    );
  },
});

const ItemGroupComponent = defineComponent({
  name: "ItemGroup",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/item", named: ["ItemGroup"] },
  hasChildren: true,
  description: "Group of list items",
  render: ({ element, children }) => {
    const { className } = element.props;
    return <ItemGroup className={className}>{children}</ItemGroup>;
  },
});

const ItemMediaComponent = defineComponent({
  name: "ItemMedia",
  schema: z.object({
    variant: z.enum(["icon", "avatar", "image"]).optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/item", named: ["ItemMedia"] },
  hasChildren: true,
  description: "Item media slot",
  render: ({ element, children }) => {
    const { variant = "icon", className } = element.props;
    return (
      <ItemMedia className={className} variant={variant}>
        {children}
      </ItemMedia>
    );
  },
});

const ItemContentComponent = defineComponent({
  name: "ItemContent",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/item", named: ["ItemContent"] },
  hasChildren: true,
  description: "Item content area",
  render: ({ element, children }) => {
    const { className } = element.props;
    return <ItemContent className={className}>{children}</ItemContent>;
  },
});

const ItemTitleComponent = defineComponent({
  name: "ItemTitle",
  schema: z.object({
    text: z.string(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/item", named: ["ItemTitle"] },
  hasChildren: false,
  description: "Item title text",
  render: ({ element }) => {
    const { text, className } = element.props;
    return <ItemTitle className={className}>{text}</ItemTitle>;
  },
});

const ItemDescriptionComponent = defineComponent({
  name: "ItemDescription",
  schema: z.object({
    text: z.string(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/item", named: ["ItemDescription"] },
  hasChildren: false,
  description: "Item description text",
  render: ({ element }) => {
    const { text, className } = element.props;
    return <ItemDescription className={className}>{text}</ItemDescription>;
  },
});

const ItemActionsComponent = defineComponent({
  name: "ItemActions",
  schema: z.object({
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/item", named: ["ItemActions"] },
  hasChildren: true,
  description: "Item actions slot",
  render: ({ element, children }) => {
    const { className } = element.props;
    return <ItemActions className={className}>{children}</ItemActions>;
  },
});

const KbdComponent = defineComponent({
  name: "Kbd",
  schema: z.object({
    keys: z.array(z.string()),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/kbd", named: ["Kbd"] },
  hasChildren: false,
  description: "Keyboard key display",
  render: ({ element }) => {
    const { keys, className } = element.props;
    const keyList = (keys as string[]) ?? [];
    return (
      <span className="inline-flex gap-1">
        {keyList.map((key, index) => (
          <Kbd className={className} key={index}>
            {key}
          </Kbd>
        ))}
      </span>
    );
  },
});

const MenubarComponent = defineComponent({
  name: "Menubar",
  schema: z.object({
    menus: z.array(
      z.object({
        trigger: z.string(),
        items: z.array(z.object({ label: z.string() })),
      })
    ),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/menubar",
    named: [
      "Menubar",
      "MenubarContent",
      "MenubarItem",
      "MenubarMenu",
      "MenubarTrigger",
    ],
  },
  hasChildren: false,
  description: "Horizontal menu bar",
  render: ({ element }) => {
    const { menus, className } = element.props;
    const menuList =
      (menus as Array<{ trigger: string; items: Array<{ label: string }> }>) ??
      [];
    return (
      <Menubar className={className}>
        {menuList.map((menu, index) => (
          <MenubarMenu key={index}>
            <MenubarTrigger>{menu.trigger}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item, itemIndex) => (
                <MenubarItem key={itemIndex}>{item.label}</MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    );
  },
});

const NavigationMenuComponent = defineComponent({
  name: "NavigationMenu",
  schema: z.object({
    items: z.array(
      z.object({
        trigger: z.string(),
        content: z.string().optional(),
        href: z.string().optional(),
      })
    ),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/navigation-menu",
    named: [
      "NavigationMenu",
      "NavigationMenuContent",
      "NavigationMenuItem",
      "NavigationMenuLink",
      "NavigationMenuList",
      "NavigationMenuTrigger",
    ],
  },
  hasChildren: false,
  description: "Navigation menu with dropdowns",
  render: ({ element }) => {
    const { items, className } = element.props;
    const navItems =
      (items as Array<{ trigger: string; content?: string; href?: string }>) ??
      [];
    return (
      <NavigationMenu className={className}>
        <NavigationMenuList>
          {navItems.map((item, index) => (
            <NavigationMenuItem key={index}>
              {item.content ? (
                <>
                  <NavigationMenuTrigger>{item.trigger}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4">{item.content}</div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href={item.href}>
                  {item.trigger}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  },
});

const PaginationComponent = defineComponent({
  name: "Pagination",
  schema: z.object({
    totalPages: z.number().optional(),
    currentPage: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/pagination",
    named: [
      "Pagination",
      "PaginationContent",
      "PaginationEllipsis",
      "PaginationItem",
      "PaginationLink",
      "PaginationNext",
      "PaginationPrevious",
    ],
  },
  hasChildren: false,
  description: "Pagination navigation",
  render: ({ element }) => {
    const { totalPages = 5, currentPage = 1, className } = element.props;
    const pages = Array.from({ length: totalPages as number }, (_, i) => i + 1);
    return (
      <Pagination className={className}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink href="#" isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {(totalPages as number) > 5 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
});

const ResizablePanelGroupComponent = defineComponent({
  name: "ResizablePanelGroup",
  schema: z.object({
    direction: z.enum(["horizontal", "vertical"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/resizable",
    named: ["ResizableHandle", "ResizablePanel", "ResizablePanelGroup"],
  },
  hasChildren: true,
  description: "Resizable panel container",
  render: ({ element, children }) => {
    const { direction = "horizontal", className } = element.props;
    return (
      <ResizablePanelGroup className={className} direction={direction}>
        {children}
      </ResizablePanelGroup>
    );
  },
});

const ResizablePanelComponent = defineComponent({
  name: "ResizablePanel",
  schema: z.object({
    defaultSize: z.number().optional(),
    minSize: z.number().optional(),
    maxSize: z.number().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/resizable", named: ["ResizablePanel"] },
  hasChildren: true,
  description: "Resizable panel",
  render: ({ element, children }) => {
    const { defaultSize, minSize, maxSize, className } = element.props;
    return (
      <ResizablePanel
        className={className}
        defaultSize={defaultSize}
        maxSize={maxSize}
        minSize={minSize}
      >
        {children}
      </ResizablePanel>
    );
  },
});

const ResizableHandleComponent = defineComponent({
  name: "ResizableHandle",
  schema: z.object({
    withHandle: z.boolean().optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/resizable", named: ["ResizableHandle"] },
  hasChildren: false,
  description: "Resizable panel handle",
  render: ({ element }) => {
    const { withHandle = false, className } = element.props;
    return <ResizableHandle className={className} withHandle={withHandle} />;
  },
});

const ToggleComponent = defineComponent({
  name: "Toggle",
  schema: z.object({
    text: z.string(),
    variant: z.enum(["default", "outline"]).optional(),
    size: z.enum(["default", "sm", "lg"]).optional(),
    className: z.string().optional(),
  }),
  imports: { from: "@/components/ui/toggle", named: ["Toggle"] },
  hasChildren: false,
  description: "Toggle button",
  render: ({ element }) => {
    const {
      text,
      variant = "default",
      size = "default",
      className,
    } = element.props;
    return (
      <Toggle className={className} size={size} variant={variant}>
        {text}
      </Toggle>
    );
  },
});

const ToggleGroupComponent = defineComponent({
  name: "ToggleGroup",
  schema: z.object({
    items: z.array(z.object({ value: z.string(), label: z.string() })),
    variant: z.enum(["default", "outline"]).optional(),
    size: z.enum(["default", "sm", "lg"]).optional(),
    className: z.string().optional(),
  }),
  imports: {
    from: "@/components/ui/toggle-group",
    named: ["ToggleGroup", "ToggleGroupItem"],
  },
  hasChildren: false,
  description: "Toggle button group",
  render: ({ element }) => {
    const {
      items,
      variant = "default",
      size = "default",
      className,
    } = element.props;
    const toggleItems =
      (items as Array<{ value: string; label: string }>) ?? [];
    return (
      <ToggleGroup
        className={className}
        inputMode="text"
        size={size}
        variant={variant}
      >
        {toggleItems.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },
});

// =============================================================================
// EXPORT ALL COMPONENTS
// =============================================================================

export const BLOCK_COMPONENTS: ComponentConfig[] = [
  // Layout
  FlexComponent,
  StackComponent,
  GridComponent,
  // Core UI
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  InputComponent,
  TextComponent,
  SeparatorComponent,
  AvatarComponent,
  ProgressComponent,
  AlertComponent,
  // Form
  CheckboxComponent,
  SwitchComponent,
  SelectComponent,
  RadioGroupComponent,
  TextareaComponent,
  LabelComponent,
  SliderComponent,
  // Display
  AccordionComponent,
  TabsComponent,
  TableComponent,
  SkeletonComponent,
  TooltipComponent,
  ScrollAreaComponent,
  // Overlay
  DialogComponent,
  SheetComponent,
  PopoverComponent,
  DropdownMenuComponent,
  AlertDialogComponent,
  // Additional
  AspectRatioComponent,
  BreadcrumbComponent,
  ButtonGroupComponent,
  ButtonGroupSeparatorComponent,
  CalendarComponent,
  CarouselComponent,
  CollapsibleComponent,
  CommandComponent,
  ContextMenuComponent,
  EmptyComponent,
  FieldComponent,
  FieldGroupComponent,
  FieldLabelComponent,
  FieldDescriptionComponent,
  FieldErrorComponent,
  FieldContentComponent,
  HoverCardComponent,
  InputGroupComponent,
  InputGroupButtonComponent,
  InputOTPComponent,
  ItemComponent,
  ItemGroupComponent,
  ItemMediaComponent,
  ItemContentComponent,
  ItemTitleComponent,
  ItemDescriptionComponent,
  ItemActionsComponent,
  KbdComponent,
  MenubarComponent,
  NavigationMenuComponent,
  PaginationComponent,
  ResizablePanelGroupComponent,
  ResizablePanelComponent,
  ResizableHandleComponent,
  ToggleComponent,
  ToggleGroupComponent,
];
