# Toast Notifications

## Overview
Toast notifications provide visual feedback to users for actions like creating, updating, or deleting resources. The app uses `react-hot-toast` for a consistent notification experience.

## Implementation

### Setup
Toast provider is configured in [src/components/providers.tsx](src/components/providers.tsx):

```typescript
import { Toaster } from "react-hot-toast";

<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#fff',
      color: '#334155',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      padding: '1rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
```

### Toast Utility
A centralized utility [src/lib/toast.ts](src/lib/toast.ts) provides consistent toast notifications:

```typescript
import { showToast } from '@/lib/toast';

// Success messages
showToast.success('Operation completed');

// Error messages
showToast.error('Something went wrong');

// API errors (automatically extracts error message)
showToast.apiError(error, 'Failed to load data');

// CRUD operations
showToast.created('Client');  // "Client created successfully"
showToast.updated('Invoice'); // "Invoice updated successfully"
showToast.deleted('User');    // "User deleted successfully"

// Loading state (returns toast ID)
const toastId = showToast.loading('Saving...');
// Later dismiss it
showToast.dismiss(toastId);

// Promise-based (automatically handles loading/success/error)
showToast.promise(
  api.createClient(data),
  {
    loading: 'Creating client...',
    success: 'Client created successfully',
    error: 'Failed to create client',
  }
);
```

## Usage Examples

### Client Creation Form
```typescript
// src/app/clients/new/page.tsx
import { showToast } from '@/lib/toast';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await api.createClient(formData);
    showToast.created('Client');
    router.push('/clients');
  } catch (error: any) {
    showToast.apiError(error, 'Failed to create client');
    // Also set form errors for display
    if (error?.error?.details) {
      setErrors(error.error.details);
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

### Deleting a Resource
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;

  try {
    await api.deleteClient(id);
    showToast.deleted('Client');
    refetch(); // Refresh data
  } catch (error: any) {
    showToast.apiError(error, 'Failed to delete client');
  }
};
```

### Using Promise Toast
```typescript
const handleSubmit = async (data: FormData) => {
  await showToast.promise(
    api.updateInvoice(id, data),
    {
      loading: 'Updating invoice...',
      success: 'Invoice updated successfully',
      error: 'Failed to update invoice',
    }
  );

  router.push('/invoices');
};
```

## Toast API

### Available Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `success(message)` | `message: string` | Show success toast |
| `error(message)` | `message: string` | Show error toast |
| `apiError(error, defaultMessage)` | `error: any, defaultMessage?: string` | Extract and show API error message |
| `created(resource)` | `resource: string` | Show "{resource} created successfully" |
| `updated(resource)` | `resource: string` | Show "{resource} updated successfully" |
| `deleted(resource)` | `resource: string` | Show "{resource} deleted successfully" |
| `loading(message)` | `message: string` | Show loading toast, returns toast ID |
| `dismiss(toastId)` | `toastId: string` | Dismiss specific toast |
| `promise(promise, messages)` | `promise: Promise<T>, messages: object` | Handle promise with loading/success/error states |

### Message Object for Promise
```typescript
{
  loading: string;  // Message while promise is pending
  success: string;  // Message when promise resolves
  error: string;    // Message when promise rejects
}
```

## Styling

Toast appearance is configured globally in the Toaster component:

- **Position**: Top-right
- **Duration**: 4 seconds (4000ms)
- **Success icon**: Green (#10b981)
- **Error icon**: Red (#ef4444)
- **Style**: White background with subtle shadow and border

To customize, edit the `toastOptions` in [src/components/providers.tsx](src/components/providers.tsx).

## Best Practices

### 1. Use Semantic Methods
Prefer semantic methods over generic ones:
```typescript
// Good
showToast.created('Client');

// Less clear
showToast.success('Client created successfully');
```

### 2. Combine with Form Errors
For forms, show toast AND set form errors:
```typescript
try {
  await api.createClient(data);
  showToast.created('Client');
  router.push('/clients');
} catch (error: any) {
  // Toast for immediate feedback
  showToast.apiError(error);

  // Form errors for field-specific validation
  if (error?.error?.details) {
    setErrors(error.error.details);
    setErrorMessage(error.error.message);
  }
}
```

### 3. Don't Overuse
Only show toasts for:
- ✅ Successful CRUD operations
- ✅ Errors that need immediate attention
- ✅ Long-running operations (loading states)

Don't show toasts for:
- ❌ Every button click
- ❌ Navigation events
- ❌ Data that's already visible in the UI

### 4. Keep Messages Short
```typescript
// Good
showToast.success('Invoice sent');

// Too verbose
showToast.success('Your invoice has been successfully sent to the client via email');
```

### 5. Use Promise Toast for Async Operations
```typescript
// Automatic loading state management
await showToast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save',
  }
);
```

## Testing

Toast notifications can be tested by importing and mocking:

```typescript
import { showToast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
    created: jest.fn(),
  },
}));

it('shows success toast on creation', async () => {
  await createClient(data);
  expect(showToast.created).toHaveBeenCalledWith('Client');
});
```

## Future Enhancements

Potential improvements:

1. **i18n Support**: Integrate with next-intl for translated messages
2. **Custom Icons**: Allow custom icons per toast
3. **Action Buttons**: Add undo/retry buttons to toasts
4. **Persistence**: Save important toasts to show on page reload
5. **Sound Effects**: Optional sound for important notifications
6. **Notification Center**: Keep history of past toasts

## Dependencies

- **react-hot-toast** (^2.x): Toast notification library
  - Lightweight (~5kb)
  - Excellent TypeScript support
  - Customizable styling
  - Promise-based API

## Migration from Console Logs

If you have existing code using `console.log` for user feedback, migrate to toasts:

```typescript
// Before
try {
  await api.deleteClient(id);
  console.log('Client deleted');
} catch (error) {
  console.error('Failed to delete client', error);
}

// After
try {
  await api.deleteClient(id);
  showToast.deleted('Client');
} catch (error) {
  showToast.apiError(error, 'Failed to delete client');
}
```
