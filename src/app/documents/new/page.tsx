// 'use client';

// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Mention from '@tiptap/extension-mention';

// export default function NewDocumentPage() {
//   const router = useRouter();
//   const [title, setTitle] = useState('');
//   const [isPublic, setIsPublic] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Mention.configure({
//         HTMLAttributes: {
//           class: 'text-blue-500 bg-blue-100 px-1 rounded',
//         },
//         suggestion: {
//           items: () => [],
//         },
//       }),
//     ],
//     content: '',
//     editorProps: {
//       attributes: {
//         class: 'min-h-[300px] border rounded p-2',
//       },
//     },
//     onCreate({ editor }) {
//       // Fix for SSR hydration
//       editor.options.editorProps.attributes = {
//         class: 'min-h-[300px] border rounded p-2',
//       };
//     },
//     onUpdate({ editor }) {
//       // Nothing for now, we'll use .getHTML() on save
//     },
//   });

//   const handleSave = async () => {
//     if (!editor) return;
//     setLoading(true);

//     const res = await fetch('/api/documents', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
//       },
//       body: JSON.stringify({
//         title,
//         content: editor.getHTML(),
//         isPublic,
//       }),
//     });

//     setLoading(false);

//     if (!res.ok) {
//       alert('Failed to create document');
//     } else {
//       const { document } = await res.json();
//       router.push(`/documents/${document.id}`);
//     }
//   };

//   return (
//     <main className="max-w-4xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Create New Document</h1>

//       <input
//         type="text"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         placeholder="Document title"
//         className="border px-3 py-2 rounded w-full mb-4"
//       />

//       {editor && <EditorContent editor={editor} />}

//       <label className="my-4 inline-flex items-center gap-2 block">
//         <input
//           type="checkbox"
//           checked={isPublic}
//           onChange={(e) => setIsPublic(e.target.checked)}
//         />
//         Public
//       </label>

//       <button
//         onClick={handleSave}
//         disabled={loading}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         {loading ? 'Saving...' : 'Create Document'}
//       </button>
//     </main>
//   );
// }



'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'text-blue-500 bg-blue-100 px-1 rounded',
        },
        suggestion: {
          items: () => [],
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] border rounded p-2',
      },
    },
    onCreate: ({ editor }) => {
      editor.options.editorProps.attributes = {
        class: 'min-h-[300px] border rounded p-2',
      };
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    setLoading(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          isPublic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to create document');
      } else {
        const { document } = await res.json();
        router.push(`/documents/${document.id}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Document</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title"
        className="border px-3 py-2 rounded w-full mb-4"
      />

      {editor && <EditorContent editor={editor} />}

      <label className="my-4 inline-flex items-center gap-2 block">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public
      </label>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Saving...' : 'Create Document'}
      </button>
    </main>
  );
}


