import {
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle,
    FaSpinner,
  } from "react-icons/fa";
  
  export const PageHeader = ({ title, subtitle, action }) => {
    return (
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1D546C]">
            {title}
          </h1>
  
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
  
        {action && (
          <div className="flex items-center gap-3">
            {action}
          </div>
        )}
      </div>
    );
  };
  
  export const ErrorAlert = ({ message }) => {
    if (!message) return null;
  
    return (
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <FaExclamationCircle className="shrink-0 text-red-500" />
        <span>{message}</span>
      </div>
    );
  };
  
  export const SuccessAlert = ({ message }) => {
    if (!message) return null;
  
    return (
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <FaCheckCircle className="shrink-0 text-emerald-500" />
        <span>{message}</span>
      </div>
    );
  };
  
  export const EmptyState = ({ title, text }) => {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#65DCD5] bg-white px-6 py-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D9FFF4] text-[#007979]">
          <FaInfoCircle className="text-xl" />
        </div>
  
        <h3 className="text-lg font-semibold text-[#1D546C]">
          {title}
        </h3>
  
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          {text}
        </p>
      </div>
    );
  };
  
  export const Loading = () => {
    return (
      <div className="flex min-h-[220px] items-center justify-center gap-3 rounded-2xl bg-white text-sm font-medium text-[#007979] shadow-sm">
        <FaSpinner className="animate-spin text-lg" />
        Loading...
      </div>
    );
  };
  
  export const Modal = ({ open, title, children, onClose }) => {
    if (!open) return null;
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D546C]/50 px-4 py-6 backdrop-blur-sm"
        onMouseDown={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-[#1D546C]">
              {title}
            </h2>
  
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-[#4E1F6E]"
            >
              ×
            </button>
          </div>
  
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  export const Field = ({ label, children }) => {
    return (
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#1D546C]">
          {label}
        </span>
  
        {children}
      </label>
    );
  };
  
  export const Badge = ({ children, tone = "green" }) => {
    const tones = {
      green: "border-emerald-200 bg-emerald-50 text-emerald-700",
      red: "border-red-200 bg-red-50 text-red-700",
      purple: "border-purple-200 bg-purple-50 text-[#4E1F6E]",
      gray: "border-gray-200 bg-gray-100 text-gray-600",
      teal: "border-[#65DCD5] bg-[#D9FFF4] text-[#007979]",
      yellow: "border-amber-200 bg-amber-50 text-amber-700",
    };
  
    return (
      <span
        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${
          tones[tone] || tones.green
        }`}
      >
        {children}
      </span>
    );
  };
  
  export const StatCard = ({ icon, label, value }) => {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_25px_rgba(29,84,108,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(29,84,108,0.12)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#D9FFF4] text-xl text-[#007979]">
          {icon}
        </div>
  
        <div className="min-w-0">
          <span className="block text-sm font-medium text-gray-500">
            {label}
          </span>
  
          <strong className="mt-1 block text-2xl font-bold text-[#1D546C]">
            {value}
          </strong>
        </div>
      </div>
    );
  };