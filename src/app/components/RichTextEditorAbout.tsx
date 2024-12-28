"use client";
import React, { useEffect, useState } from "react";
//import ReactQuill from "react-quill";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function RichTextEditorAbout({ about, setAbout }: any) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (about) {
      setValue(about);
    }
  }, [about]);

  return (
    <div className="w-full flex flex-col md:col-span-3">
      <p className="text-sm mb-1 font-semibold">Detaylı Bilgi</p>
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
        className="h-[280px] border-gray-200 mb-6 "
        theme="snow"
        value={about}
        onChange={setAbout}
      />
    </div>
  );
}
