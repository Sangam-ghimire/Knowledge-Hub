'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';

type Props = {
  initialContent: string;
  documentId: string;
  readOnly: boolean;
};

export default function TiptapEditor({ initialContent, documentId, readOnly }: Props) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const autoSave = useMemo(() => {
    return debounce(async (html: string) => {
      if (!documentId) {
        console.error('Missing documentId');
        setSaveStatus('error');
        return;
      }

      setSaveStatus('saving');

      try {
        const res = await fetch(`/api/documents/${documentId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: html }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('Auto-save failed:', res.status, text);
          setSaveStatus('error');
        } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 1500);
        }
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    }, 1000);
  }, [documentId]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '<p></p>',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          'focus:outline-none prose dark:prose-invert max-w-full text-lg leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        const html = editor.getHTML();
        autoSave(html);
      }
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  return (
    <div className="relative">
      <div className="absolute top-[-2rem] right-0 text-sm text-gray-400">
        {saveStatus === 'saving' && 'Saving...'}
        {saveStatus === 'saved' && 'Saved ✓'}
        {saveStatus === 'error' && 'Failed ✗'}
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg mx-auto w-full max-w-[8.5in] min-h-[11in] p-10">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
