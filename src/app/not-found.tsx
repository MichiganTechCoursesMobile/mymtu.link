export default function NotFound() {
  return (
    <div className="h-screen mx-auto grid place-items-center text-center px-8">
      <div>
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
          height="1em"
          width="1em"
          className="w-20 h-20 mx-auto stroke-error"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path d="M3 7v4a1 1 0 001 1h3M7 7v10M10 8v8a1 1 0 001 1h2a1 1 0 001-1V8a1 1 0 00-1-1h-2a1 1 0 00-1 1zM17 7v4a1 1 0 001 1h3M21 7v10" />
        </svg>
        <h1 className="mt-4 !text-3xl !leading-snug md:!text-4xl">Uh oh!</h1>
        <p className="mt-2 text-error !text-2xl !leading-snug md:!text-2xl">
          Basket not found!
        </p>
      </div>
    </div>
  );
}
