import ReactMarkdown from "react-markdown";

const API_BASE = "http://103.192.198.186:5051/";

export default function OutputPreview({
  title,
  result,
  emptyMessage
}) {

  const generatedContent = result?.data?.generated_content;

  // pdf_url from backend: "uploads/generated_pdfs/homework_abc.pdf"
  const pdfUrl = result?.data?.pdf_url
    ? `${API_BASE}/${result.data.pdf_url}`
    : null;

  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-[#FAFBFF] p-6">

      <h2 className="text-lg font-bold text-[#1E1B4B] mb-3">
        {title}
      </h2>

      {generatedContent ? (

        <div className="space-y-4">

          {/* STATUS BADGE */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold capitalize">
              ✓ {result?.data?.status || "completed"}
            </span>
          </div>

          {/* CONTENT */}
          <div
            className="
    text-base
    leading-8
    text-gray-700
    bg-violet-50
    border
    border-violet-100
    rounded-3xl
    p-8
    font-normal
    min-h-[400px]
    overflow-auto
    max-h-[700px]
    overflow-y-auto
    pr-3
  "
            style={{ lineHeight: "2.1", fontSize: "16px" }}
          >
            <ReactMarkdown>
              {generatedContent}
            </ReactMarkdown>
          </div>

          {/* PDF ACTIONS */}
          {pdfUrl && (

            <div className="flex gap-4 mt-4">

              {/* OPEN PDF */}

              <a
                href={pdfUrl}

                target="_blank"

                rel="noreferrer"

                className="
        inline-flex items-center
        px-5 py-3 rounded-2xl
        bg-violet-600 text-white
        text-sm font-semibold
        hover:bg-violet-700 transition
      "
              >
                Open Generated PDF
              </a>

              {/* SAVE PDF */}

              <button

                onClick={async () => {

                  const response =
                    await fetch(pdfUrl);

                  const blob =
                    await response.blob();

                  const url =
                    window.URL.createObjectURL(blob);

                  const link =
                    document.createElement("a");

                  link.href = url;

                  link.download =
                    "generated_notes.pdf";

                  document.body.appendChild(link);

                  link.click();

                  link.remove();

                  window.URL.revokeObjectURL(url);
                }}

                className="
    inline-flex items-center
    px-5 py-3 rounded-2xl
    border border-violet-300
    bg-white
    text-violet-700
    text-sm font-semibold
    hover:bg-violet-50 transition
  "
              >

                Save PDF

              </button>

            </div>
          )}

        </div>

      ) : result ? (

        // result aaya but generated_content empty hai
        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-700">
            Response received but no content generated. Check server logs.
          </p>
          <pre className="text-xs text-gray-500 mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

      ) : (

        <p className="text-sm text-gray-500 leading-7">
          {emptyMessage}
        </p>

      )}

    </div>
  );
}