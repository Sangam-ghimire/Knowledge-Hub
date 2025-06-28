'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type Props = {
  initialContent: string;
  documentId: string;
  readOnly?: boolean;
};

export default function TiptapEditor({ initialContent, documentId, readOnly = false }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '<p></p>',
    editable: !readOnly,
    onUpdate: async ({ editor }) => {
      if (readOnly) return;

      const html = editor.getHTML();
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ content: html }),
        });
      } catch (err) {
        console.error('Failed to save document', err);
      }
    },
  });

  useEffect(() => {
    if (editor && readOnly !== undefined) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  return (
    <div className="rounded border border-gray-600 bg-[#121212] p-4 text-white">
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror {
          color: white !important;
          background-color: #121212 !important;
          min-height: 300px;
          padding: 0.75rem;
        }

        .ProseMirror > * {
          color: white;
        }
      `}</style>
    </div>
  );
}
