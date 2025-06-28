'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { useEffect } from 'react';

export default function TiptapEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'text-blue-500 bg-blue-100 px-1 rounded',
        },
        suggestion: {
          items: () => [], // Placeholder for mention suggestions
          render: () => ({
      onStart: () => {},
      onUpdate: () => {},
      onExit: () => {},
    }),
        },
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    //  This line avoids SSR hydration issues
    editorProps: {
      attributes: {
        class: 'prose',
      },
    },
    autofocus: true,
    editable: true,
    injectCSS: false,
    immediatelyRender: false, 
  });

  // Sync editor content if the prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border p-2 rounded min-h-[300px]">
      <EditorContent editor={editor} />
    </div>
  );
}
