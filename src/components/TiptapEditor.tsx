'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type Props = {
  initialContent: string;
  documentId: string;
  readOnly: boolean;
};

export default function TiptapEditor({ initialContent, documentId, readOnly }: Props) {
  console.log('TiptapEditor props:', { documentId, readOnly });

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '<p></p>',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'focus:outline-none prose dark:prose-invert max-w-full text-lg leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      if (readOnly) return;

      const html = editor.getHTML();
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage');
        return;
      }

      if (!documentId) {
        console.error('Missing documentId in PUT request');
        return;
      }

      console.log('Sending PUT to:', `/api/documents/${documentId}`);

      fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: html }),
      })
        .then(async (res) => {
          const text = await res.text();
          if (!res.ok) {
            console.error('PUT failed:', res.status, text);
          } else {
            console.log('PUT success:', res.status);
          }
        })
        .catch(console.error);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
      console.log('Set editor editable:', !readOnly);
    }
  }, [readOnly, editor]);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg mx-auto w-full max-w-[8.5in] min-h-[11in] p-10">
      <EditorContent editor={editor} />
    </div>
  );
}
