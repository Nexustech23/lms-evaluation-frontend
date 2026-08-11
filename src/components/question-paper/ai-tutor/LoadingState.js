export default function LoadingState({

  title,

  subtitle,

  steps,

  loadingStep

}) {

  return (

    <div
      className="
        bg-white
        rounded-[32px]
        border
        border-violet-100
        p-10
        flex
        flex-col
        items-center
        justify-center
        gap-6
        shadow-sm
        min-h-[500px]
      "
    >

      {/* Spinner */}

      <div
        className="
          w-24
          h-24
          rounded-full
          border-[6px]
          border-violet-100
          border-t-violet-600
          animate-spin
        "
      />

      {/* Heading */}

      <div className="text-center">

        <h2
          className="
            text-2xl
            font-bold
            text-[#1E1B4B]
            mb-2
          "
        >
          {title}
        </h2>

        <p
          className="
            text-sm
            text-gray-500
          "
        >
          {subtitle}
        </p>

      </div>

      {/* Steps */}

      <div
        className="
          flex
          flex-col
          gap-4
          w-full
          max-w-md
        "
      >

        {steps.map((step, index) => (

          <div
            key={index}
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* Status Icon */}

            <div
              className={`
                w-6
                h-6
                rounded-full
                flex
                items-center
                justify-center
                text-xs
                font-bold

                ${
                  index < loadingStep
                    ? "bg-green-100 text-green-600"
                    : index === loadingStep
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-400"
                }
              `}
            >

              {
                index < loadingStep
                  ? "✓"
                  : index === loadingStep
                  ? "⋯"
                  : "•"
              }

            </div>

            {/* Step Text */}

            <p
              className={`
                text-sm
                font-medium

                ${
                  index <= loadingStep
                    ? "text-[#1E1B4B]"
                    : "text-gray-400"
                }
              `}
            >
              {step}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}