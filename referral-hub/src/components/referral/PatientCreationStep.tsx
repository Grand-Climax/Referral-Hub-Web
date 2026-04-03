import {
  ClipboardList,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PatientCreationFormFields } from "@/types/patient";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

const selectTriggerCls =
  "h-11 w-full rounded-xl border border-border/70 bg-background px-3 shadow-sm " +
  "transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20 " +
  "data-[placeholder]:text-muted-foreground font-medium";

export default function PatientCreationStep({
  hideNationalIdInput,
}: {
  hideNationalIdInput?: boolean;
}) {
  const { control } = useFormContext<PatientCreationFormFields>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          1. Patient Information
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                First Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="First name"
                  required
                  {...field}
                  className="h-11 rounded-xl bg-background border-border/70"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="middle_name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Middle name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  className="h-11 rounded-xl bg-background border-border/70"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                Last Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Last name"
                  required
                  {...field}
                  className="h-11 rounded-xl bg-background border-border/70"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                Date of Birth <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  required
                  {...field}
                  className="h-11 rounded-xl bg-background border-border/70"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sex"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                Sex <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="home_region"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                Home Region <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Region"
                  required
                  {...field}
                  className="h-11 rounded-xl bg-background border-border/70"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="space-y-2 sm:col-span-1">
              <FormLabel>
                Phone <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="+251 ..."
                  required
                  {...field}
                  className="h-11 rounded-xl bg-background border-border/70"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!hideNationalIdInput && (
          <FormField
            control={control}
            name="national_id_enc"
            render={({ field }) => (
              <FormItem className="space-y-2 sm:col-span-2">
                <FormLabel>
                  National ID <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="National ID"
                    required
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="h-11 rounded-xl bg-background border-border/70"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}

