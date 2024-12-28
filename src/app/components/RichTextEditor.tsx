import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function RichTextEditor({ defaultValue }: any) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className="w-full md:col-span-3 h-[460px] p-2 bg-gray-100 rounded-xl">
      <p className="text-xs mb-1">Detaylı Bilgi</p>
      <ReactQuill
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
          ],
        }}
        className="h-[380px] rounded-lg border-gray-200"
        theme="snow"
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
