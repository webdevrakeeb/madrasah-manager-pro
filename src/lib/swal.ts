import Swal, { type SweetAlertOptions } from "sweetalert2";

// Themed SweetAlert2 instance that adopts the app's design tokens.
// Uses shadcn/tailwind classes so dialogs match the dashboard.
export const swal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup:
      "rounded-xl border border-border bg-card text-card-foreground shadow-xl",
    title: "font-display text-xl text-foreground",
    htmlContainer: "text-sm text-muted-foreground",
    actions: "gap-2 mt-2",
    confirmButton:
      "inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors",
    denyButton:
      "inline-flex items-center justify-center rounded-md bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:bg-destructive/90 transition-colors",
    cancelButton:
      "inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors",
    icon: "!border-border",
  },
});

export function confirmDelete(
  title = "Are you sure?",
  text = "This action cannot be undone.",
  extra: SweetAlertOptions = {}
) {
  return swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    ...extra,
  });
}
