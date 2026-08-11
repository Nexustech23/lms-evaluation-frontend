import { FileText } from "lucide-react";

export default function FileUploadBox({

  file,

  setFile,

  title,

  supportedText

}) {

  return (

    <div className="mt-8">

      <div className="flex items-center gap-2 mb-4">

        <FileText
          size={16}
          className="text-blue-500"
        />

        <span
          className="
            text-sm
            font-semibold
            text-[#1E1B4B]
          "
        >
          {title}
        </span>

        <span
          className="
            text-xs
            text-gray-400
          "
        >
          (optional)
        </span>

      </div>

      {/* FILE INPUT */}

      <input
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
        hidden
        id="fileUpload"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      {/* UPLOAD BOX */}

      <div
        className="
          border
          border-dashed
          border-gray-300
          rounded-3xl
          bg-[#FAFBFF]
          p-6
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
        "
      >

        <div>

          <p
            className="
              text-sm
              font-semibold
              text-[#1E1B4B]
            "
          >
            Upload File
          </p>

          <p
            className="
              text-xs
              text-gray-400
              mt-1
            "
          >
            {supportedText}
          </p>

        </div>

        <label
          htmlFor="fileUpload"
          className="
            px-6
            py-3
            rounded-2xl
            bg-violet-600
            text-white
            text-sm
            font-semibold
            hover:bg-violet-700
            transition
            cursor-pointer
            text-center
          "
        >
          Upload
        </label>

      </div>

      {/* FILE PREVIEW */}

      {file && (

        <div
          className="
            mt-5
            flex
            items-center
            gap-4
            bg-gray-50
            border
            border-gray-200
            rounded-3xl
            p-4
          "
        >

          {/* ICON */}

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-red-100
              flex
              items-center
              justify-center
              text-red-500
              font-bold
              text-sm
            "
          >
            PDF
          </div>

          {/* FILE INFO */}

          <div className="flex-1 overflow-hidden">

            <p
              className="
                text-sm
                font-semibold
                text-[#1E1B4B]
                truncate
              "
            >
              {file.name}
            </p>

            <p
              className="
                text-xs
                text-gray-400
                mt-1
              "
            >
              Ready for AI processing
            </p>

          </div>

          {/* REMOVE */}

          <button
            onClick={() => setFile(null)}
            className="
              text-sm
              text-red-500
              font-semibold
              hover:text-red-600
            "
          >
            Remove
          </button>

        </div>

      )}

    </div>
  );
}