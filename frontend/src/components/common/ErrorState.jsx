import { AlertTriangle, RefreshCcw } from "lucide-react";

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <AlertTriangle size={60} className="text-red-500" />

        <h2 className="mt-5 text-2xl font-bold text-red-700">
          Something went wrong
        </h2>

        <p className="mt-2 max-w-lg text-gray-600">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;