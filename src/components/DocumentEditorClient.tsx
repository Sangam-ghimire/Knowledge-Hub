'use client';

import { useEffect } from 'react';
import TiptapEditor from './TiptapEditor';

type Props = {
  content: string;
  documentId: string;
  readOnly: boolean;
};

export default function DocumentEditorClient({ content, documentId, readOnly }: Props) {
  useEffect(() => {
    console.log('DocumentEditorClient mounted with:', { documentId, readOnly });
  }, [documentId, readOnly]);

  return (
      <div className="flex-1">
        <TiptapEditor
          initialContent={content}
          documentId={documentId}
          readOnly={readOnly}
        />
      </div>
    
  );
}
