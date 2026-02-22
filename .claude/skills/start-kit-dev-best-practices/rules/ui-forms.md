# ui-forms: Use React Hook Form + Zod + Field Components

## Priority: HIGH

## Explanation

Forms use React Hook Form with Zod validation via `zodResolver`. Each field uses the `Controller` component with `Field`, `FieldLabel`, and `FieldError` components from `@/components/ui/field` for consistent layout and accessibility.

## Bad Example

```tsx
// Wrong: uncontrolled form, no validation, no field components
function CreateOrgForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    // No validation, no error display
    createOrg({ name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Good Example

```tsx
// src/features/organizations/organizations.create-dialog.tsx — actual pattern
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const createOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

function OrganizationCreateDialog() {
  const form = useForm<CreateOrgForm>({
    resolver: zodResolver(createOrgSchema),
    mode: "onChange",
    defaultValues: { name: "", slug: "" },
  });

  const createMutation = useMutation({
    ...createOrganizationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      toast.success(t("organization.created"));
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor={field.name}>
              {t("organization.name")}
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending && <Spinner />}
        {t("common.create")}
      </Button>
    </form>
  );
}
```

## Good Example: Field Component System

```tsx
// Available field components from @/components/ui/field
<Field>                  {/* Wrapper with orientation: vertical | horizontal */}
  <FieldLabel>           {/* Accessible label */}
  <Input />              {/* Or Textarea, Select, Combobox, etc. */}
  <FieldDescription>     {/* Helper text */}
  <FieldError>           {/* Validation errors */}
</Field>

<FieldSet>               {/* Grouped fields */}
  <FieldLegend>          {/* Group label */}
  <FieldGroup>           {/* Field container */}
    <Field>...</Field>
  </FieldGroup>
</FieldSet>
```

## Context

- Always use `zodResolver` for form validation
- `mode: "onChange"` for real-time validation feedback
- Use `Controller` for each field — connects React Hook Form to UI components
- `data-invalid` attribute on `Field` enables invalid-state styling
- `FieldError` accepts `errors` prop as array of `FieldError` objects
- Mutations use factory functions from `*.factory.mutations.ts`
- Success: invalidate relevant queries, show toast, close dialog
- Error: show toast with error message
- Loading: disable submit button, show `Spinner` component
- All user-facing text uses i18n: `t("key")` from `useTranslation()`
