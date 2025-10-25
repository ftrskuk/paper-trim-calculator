type IconProps = {
  className?: string;
};

const baseIconClass = "inline-block align-middle";

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`${baseIconClass} ${className ?? "h-5 w-5"}`.trim()}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`${baseIconClass} ${className ?? "h-5 w-5"}`.trim()}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2H6v1a1 1 0 0 1-2 0V6H3a1 1 0 1 1 0-2h1V3a1 1 0 0 1 1-1zm0 10a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2H6v1a1 1 0 0 1-2 0v-1H3a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1-1zm6.447-7.724a1 1 0 0 1 1.894 0l.502 1.507a1 1 0 0 0 .632.632l1.507.502a1 1 0 0 1 0 1.894l-1.507.502a1 1 0 0 0-.632.632l-.502 1.507a1 1 0 0 1-1.894 0l-.502-1.507a1 1 0 0 0-.632-.632l-1.507-.502a1 1 0 0 1 0-1.894l1.507-.502a1 1 0 0 0 .632-.632l.502-1.507z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`${baseIconClass} ${className ?? "h-5 w-5"}`.trim()}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9zM7 8a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0V8zm5-1a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

