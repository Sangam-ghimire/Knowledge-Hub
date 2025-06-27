'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function Editor({ content, onChange }: { content: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="border rounded-lg p-4">
      <EditorContent editor={editor} />
    </div>
  );
}
