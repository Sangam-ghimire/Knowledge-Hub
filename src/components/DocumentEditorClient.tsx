'use client';

import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

type Props = {
  content: string;
  documentId: string;
  readOnly: boolean;
};

export default function DocumentEditorClient({ content, documentId, readOnly }: Props) {
  return (
    <TiptapEditor
      initialContent={content}
      documentId={documentId}
      readOnly={readOnly}
    />
  );
}
