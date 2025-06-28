'use client';

import dynamic from 'next/dynamic';
import type { EditorProps } from '@/types/editor';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

export default function DocumentEditorClient({ initialContent, documentId, readOnly }: EditorProps) {
  return (
    <TiptapEditor
      initialContent={initialContent}
      documentId={documentId}
      readOnly={readOnly}
    />
  );
}
