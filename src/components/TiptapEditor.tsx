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
    content: initialContent || '<p></p>', // fallback
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
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
    <div className="rounded border border-gray-700 bg-[#1a1a1a] p-4">
      <EditorContent editor={editor} />
      <style jsx global>{`
        .editor-content {
          color: white;
          background-color: #1a1a1a;
          min-height: 200px;
          outline: none;
        }

        .editor-content p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
