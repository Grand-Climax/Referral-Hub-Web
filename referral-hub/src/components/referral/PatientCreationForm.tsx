"use client";

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
import { useGetRegionsQuery } from "@/features/reference/regionsApi";

const selectTriggerCls =
  "h-11 w-full rounded-xl border border-border/70 bg-background px-3 shadow-sm " +
  "transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20 " +
  "data-[placeholder]:text-muted-foreground font-medium";

export default function PatientCreationForm() {
  const { control } = useFormContext<PatientCreationFormFields>();
  const { data: regions = [], isLoading: isRegionsLoading } =
    useGetRegionsQuery();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                className="h-11 rounded-xl border-border/70 bg-background"
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
                className="h-11 rounded-xl border-border/70 bg-background"
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
                className="h-11 rounded-xl border-border/70 bg-background"
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
                className="h-11 rounded-xl border-border/70 bg-background"
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
              <Select onValueChange={field.onChange} value={field.value}>
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
        render={({ field }) => {
          const selectedInOptions = regions.some(
            (region) => region === field.value,
          );

          return (
            <FormItem className="space-y-2">
              <FormLabel>
                Home Region <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isRegionsLoading && regions.length === 0}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue
                      placeholder={
                        isRegionsLoading
                          ? "Loading regions..."
                          : "Select home region"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    {!selectedInOptions && field.value ? (
                      <SelectItem value={field.value}>{field.value}</SelectItem>
                    ) : null}
                    {regions.length === 0 && !field.value ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {isRegionsLoading
                          ? "Loading regions..."
                          : "No regions available"}
                      </div>
                    ) : (
                      regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          );
        }}
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
                className="h-11 rounded-xl border-border/70 bg-background"
              />
            </FormControl>
          </FormItem>
        )}
      />

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
                className="h-11 rounded-xl border-border/70 bg-background"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
