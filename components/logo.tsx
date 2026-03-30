export function Logo({ className = "", iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 bg-[#004f32] rounded-full flex items-center justify-center text-white shrink-0 p-1.5 shadow-sm">
        {/* Abstract Goat/Mountain Horns SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Horns */}
          <path d="M3 8c0-3.5 2.5-6 6-6s4 2 4 4" />
          <path d="M21 8c0-3.5-2.5-6-6-6s-4 2-4 4" />
          {/* Head & Snout */}
          <path d="M12 6l-4 8 2 6h4l2-6-4-8z" />
          {/* Ears */}
          <path d="M8 14l-4 2 2-4" />
          <path d="M16 14l4 2-2-4" />
        </svg>
      </div>
      {!iconOnly && (
        <span className="text-2xl font-extrabold tracking-tight text-[#004f32]">
          NabTravel
        </span>
      )}
    </div>
  );
}
