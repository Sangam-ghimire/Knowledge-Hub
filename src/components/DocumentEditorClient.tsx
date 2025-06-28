'use client';

import { useEffect } from 'react';
import TiptapEditor from './TiptapEditor'; // direct import, not dynamic

type Props = {
  content: string;
  documentId: string;
  readOnly: boolean;
};

export default function DocumentEditorClient({ content, documentId, readOnly }: Props) {
  useEffect(() => {
    console.log('✅ DocumentEditorClient mounted with:', { documentId, readOnly });
  }, [documentId, readOnly]);

  return (
    <div>
      <TiptapEditor
        initialContent={content}
        documentId={documentId}
        readOnly={readOnly}
      />
    </div>
  );
}
