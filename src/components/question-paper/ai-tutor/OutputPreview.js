export default function OutputPreview({
  title,
  result,
  emptyMessage
}) {

  // app/api/routers/ai_tutor.py's job-status response is flat (success,
  // status, step, solution_url, html_content, ...) — not nested under a
  // "data" key, and html_content is a complete standalone HTML document
  // (its own <style>/<head>), not markdown — rendered via a sandboxed
  // iframe rather than ReactMarkdown, which would just show the raw tags.
  const htmlContent = result?.html_content;
  const pdfUrl = result?.solution_url || null;

  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-[#FAFBFF] p-6">

      <h2 className="text-lg font-bold text-[#1E1B4B] mb-3">
        {title}
      </h2>

      {htmlContent ? (

        <div className="space-y-4">

          {/* STATUS BADGE */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold capitalize">
              ✓ {result?.status || "completed"}
            </span>
          </div>

          {/* CONTENT */}
          <iframe
            srcDoc={htmlContent}
            sandbox=""
            title={title}
            className="w-full rounded-3xl border border-violet-100 bg-white"
            style={{ minHeight: 500, height: "70vh" }}
          />

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